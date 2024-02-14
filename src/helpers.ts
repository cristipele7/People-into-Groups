import { Connection } from "mysql"
import { ConncetionDB } from "./connection"
import { IGroup, IPeople } from "./models"

export const getRecursiveGroups = async(connection: Connection, groupID?: number): Promise<IGroup[]> => {
  return new Promise((resolve, reject) => {
    connection.query(
      `WITH RECURSIVE groups_hierarchy (id, name, date_created, date_updated, parent_group_id) AS (
        SELECT id, name, date_created, date_updated, parent_group_id
        FROM organization.groups
        WHERE parent_group_id ${groupID ? `= ${groupID}` : 'IS NULL'}
    
        UNION ALL
    
        SELECT gr.id, gr.name, gr.date_created, gr.date_updated, gr.parent_group_id
        FROM organization.groups gr
        INNER JOIN groups_hierarchy gh ON gr.parent_group_id = gh.id
    )
    SELECT * FROM groups_hierarchy`,
      (err, resp) => {
        if (err) {
          reject(err)
        } else {
          resolve(resp)
        }
      }
    )
  })
}

export const getHierarchy = async (dataHierarchy?: { personID?: number }) => {
  const connection = await ConncetionDB()
  let hierarchicalGroups: IGroup[] = await getRecursiveGroups(connection)
  let people: IPeople[] = await new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM people`,
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

  const all = [...hierarchicalGroups, ...people]
  let hierarchicalData: (IGroup | IPeople)[] = []
  hierarchicalGroups.reverse().map(data => {
    const findParentInHierarchy = all.filter((hd: (IGroup | IPeople)) => hd.parent_group_id === data.id)
    data.children = findParentInHierarchy
    if (!data.parent_group_id) {
      hierarchicalData = [data]
    }
  })

  return hierarchicalData
}

export const updateGroupsWhenChangeParentGroup = async (
  connection: Connection,
  olsParentGroupID: number,
  newParentGroupID: number
) => {
  const ids: number[] = [olsParentGroupID, newParentGroupID]
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE organization.groups SET date_updated=? WHERE id IN (?)`,
      [new Date(), ids],
      async (err) => {
        if (err) {
          reject(err)
        } else {
          resolve(`Records with ids ${ids} from groups updated after people or group was added/removed from group`)
        }
      }
    )
  })
}
