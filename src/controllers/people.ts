import { Request, Response } from "express";
import { ConncetionDB } from '../connection'

export const createInPeople = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, job, groupID } = req.body
    if (!firstName || !lastName || !job || !groupID) {
      throw new Error('firstName, lastName, job and groupID are mandatory')
    }

    const connection = await ConncetionDB()
    const promiseResponse = await new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO people (first_name, last_name, job, parent_group_id) VALUES (?, ?, ?, ?)`,
        [firstName, lastName, job, groupID],
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve('Record created in people')
          }
        }
      )
    })

    res.status(200).send(promiseResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const editInPeople = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { firstName, lastName, job } = req.body
    if (!firstName && !lastName && !job) {
      throw new Error('firstName, lastName or job is mandatory')
    }

    const setQuery: string[] = []
    if (firstName) {
      setQuery.push(`first_name='${firstName}'`)
    }
    if (lastName) {
      setQuery.push(`last_name='${lastName}'`)
    }
    if (job) {
      setQuery.push(`job='${job}'`)
    }
    const connection = await ConncetionDB()
    const promiseResponse = await new Promise((resolve, reject) => {
      connection.query(
        `UPDATE people SET ${setQuery.toString()} WHERE id=?`,
        [id],
        (err, resp) => {
          if (err) {
            reject(err)
          } else {
            if (resp.affectedRows === 0) {
              reject(`Record with id ${id} doesn't exists in people`)
            }
            resolve(`Record with id ${id} updated in people`)
          }
        }
      )
    })

    res.status(200).send(promiseResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const deleteInPeople = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const connection = await ConncetionDB()
    const promiseResponse = await new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM people WHERE id=?',
        [id],
        (err, resp) => {
          if (err) {
            reject(err)
          } else {
            if (resp.affectedRows === 0) {
              reject(`Record with id ${id} doesn't exists in people`)
            }
            resolve(`Record with id ${id} deleted in people`)
          }
        }
      )
    })

    res.status(200).send(promiseResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const movePeopleToAnotherGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { groupID } = req.body
    if (!groupID) {
      throw new Error('groupID is mandatory')
    }
    
    const connection = await ConncetionDB()
    const promiseResponse = await new Promise((resolve, reject) => {
      connection.query(
        `UPDATE people SET parent_group_id=? WHERE id=?`,
        [groupID, id],
        (err, resp) => {
          if (err) {
            reject(err)
          } else {
            if (resp.affectedRows === 0) {
              reject(`Record with id ${id} doesn't exists in people`)
            }
            resolve(`Record with id ${id} from people moved in group with id ${groupID}`)
          }
        }
      )
    })

    res.status(200).send(promiseResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}
