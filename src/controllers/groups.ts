import { Request, Response } from "express";
import { ConncetionDB } from '../connection'
import { updateGroupsWhenChangeParentGroup } from "../helpers";

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, parentGroupID } = req.body
    if (!name || !parentGroupID) {
      throw new Error('name and parentGroupID are mandatory')
    }

    const connection = await ConncetionDB()
    const promiseResponse = await new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO organization.groups (name, parent_group_id) VALUES (?, ?)`,
        [name, parentGroupID],
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve('Group created')
          }
        }
      )
    })

    res.status(200).send(promiseResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const editGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name } = req.body
    if (!name) {
      throw new Error('name is mandatory')
    }

    const connection = await ConncetionDB()
    const promiseResponse = await new Promise((resolve, reject) => {
      connection.query(
        `UPDATE organization.groups SET name=? WHERE id=?`,
        [name, id],
        (err, resp) => {
          if (err) {
            reject(err)
          } else {
            if (resp.affectedRows === 0) {
              reject(`Record with id ${id} doesn't exists in groups`)
            }
            resolve(`Group with id ${id} updated`)
          }
        }
      )
    })

    res.status(200).send(promiseResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const connection = await ConncetionDB()
    const promiseResponse = await new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM organization.groups WHERE id=?',
        [id],
        (err, resp) => {
          if (err) {
            reject(err)
          } else {
            if (resp.affectedRows === 0) {
              reject(`Record with id ${id} doesn't exists in groups`)
            }
            resolve(`Group with id ${id} deleted`)
          }
        }
      )
    })

    res.status(200).send(promiseResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const moveGroupToAnotherGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { parentGroupID } = req.body
    if (!parentGroupID) {
      throw new Error('parentGroupID is mandatory')
    }
    if (id == parentGroupID) {
      throw new Error('You cannot move a group into itself')
    }

    const connection = await ConncetionDB()

    const oldParentGroupIDPromise = await new Promise<{ parent_group_id: number }[]>((resolve, reject) => {
      connection.query(
        `SELECT parent_group_id FROM organization.groups WHERE id=?`,
        [id],
        async (err, resp) => {
          if (err) {
            reject(err)
          } else {
            resolve(resp)
          }
        }
      )
    })
    const oldParentGroupID = oldParentGroupIDPromise[0].parent_group_id
    
    const promiseResponse = await new Promise((resolve, reject) => {
      connection.query(
        `UPDATE organization.groups SET parent_group_id=? WHERE id=?`,
        [parentGroupID, id],
        async (err, resp) => {
          if (err) {
            reject(err)
          } else {
            if (resp.affectedRows === 0) {
              reject(`Record with id ${id} doesn't exists in groups`)
            }
            await updateGroupsWhenChangeParentGroup(connection, oldParentGroupID, parentGroupID)
            resolve(`Record with id ${id} from groups moved in group with id ${parentGroupID}`)
          }
        }
      )
    })

    res.status(200).send(promiseResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}
