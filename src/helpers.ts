import { ConncetionDB } from "./connection"
import { IGroup, IPeople } from "./models"

export const getHierarchy = async (dataHierarchy?: { personID?: number, groupID?: number }) => {
  const connection = await ConncetionDB()
  let hierarchicalGroups: IGroup[] = await new Promise((resolve, reject) => {
    connection.query(
      `WITH RECURSIVE groups_hierarchy (id, name, date_created, date_updated, parent_group_id) AS (
        SELECT id, name, date_created, date_updated, parent_group_id
        FROM organization.groups
        WHERE parent_group_id IS NULL
    
        UNION ALL
    
        SELECT gr.id, gr.name, gr.date_created, gr.date_updated, gr.parent_group_id
        FROM organization.groups gr
        INNER JOIN groups_hierarchy gh ON gr.parent_group_id = gh.id
    )
    SELECT id, parent_group_id FROM groups_hierarchy`,
      (err, resp) => {
        if (err) {
          reject(err)
        } else {
          resolve(resp)
        }
      }
    )
  })
  let people: IPeople[] = await new Promise((resolve, reject) => {
    connection.query(
      `SELECT id, parent_group_id FROM people`,
      (err, resp) => {
        if (err) {
          reject(err)
        } else {
          resolve(resp)
        }
      }
    )
  })

  const levels: {
    groupID: number,
    level: number
  }[] = []
  hierarchicalGroups.map(data => {
    const levelObj = levels.find(child => child.groupID === data.parent_group_id)
    const newLevel = levelObj ? levelObj.level + 1 : 0
    levels.push({
      groupID: data.id,
      level: newLevel
    })
    data.level = newLevel
  })
  people.map(data => {
    const levelObj = levels.find(child => child.groupID === data.parent_group_id)
    data.level = levelObj ? levelObj.level + 1 : 1
  })

  if (dataHierarchy?.personID) {
    const levelPersonID = people.find(person => person.id === dataHierarchy.personID).level
    hierarchicalGroups = hierarchicalGroups.filter(group => group.level < levelPersonID)
    people = []
  }

  let levelGroupID: number
  if (dataHierarchy?.groupID) {
    levelGroupID = hierarchicalGroups.find(group => group.id === dataHierarchy.groupID).level
  }

  const all = [...hierarchicalGroups, ...people]
  let hierarchicalData: (IGroup | IPeople)[] = []
  hierarchicalGroups.reverse().map(data => {
    const findParentInHierarchy = all.filter((hd: (IGroup | IPeople)) => hd.parent_group_id === data.id)
    data.children = findParentInHierarchy
    if (levelGroupID) {
      if (data.level > levelGroupID && data.parent_group_id === dataHierarchy.groupID) {
        hierarchicalData = [...hierarchicalData, data]
      }
    } else if (!data.parent_group_id) {
      hierarchicalData = [data]
    }
  })
  if (levelGroupID) {
    const findPeople = people.filter((person: (IGroup | IPeople)) => person.parent_group_id === dataHierarchy.groupID)
    hierarchicalData = [...hierarchicalData, ...findPeople]
  }

  return hierarchicalData
}