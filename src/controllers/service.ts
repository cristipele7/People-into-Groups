import { NextFunction, Request, Response } from "express";
import { getRedisClient } from "../redisClient";
import { getHierarchy, getRecursiveGroups } from "../helpers";
import { ConncetionDB } from "../connection";

export const cacheHierarchy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const redisClient = getRedisClient()
    const redisHierarchy = await redisClient.get('hierarchy');
    if (redisHierarchy) {
      const result = JSON.parse(redisHierarchy)

      res.status(200).send({
        fromCache: true,
        data: result
      })
    } else {
      next()
    }
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const hierarchy = async (req: Request, res: Response) => {
  try {
    const hierarchicalData = await getHierarchy()

    const redisClient = getRedisClient()
    await redisClient.set('hierarchy', JSON.stringify(hierarchicalData), { EX: 3, NX: true });
    res.status(200).send({
      fromCache: false,
      data: hierarchicalData
    })
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const allGroupsAbovePerson = async (req: Request, res: Response) => {
  try {
    const { peopleId } = req.params
    const connection = await ConncetionDB()
    const promiseResponse = await new Promise<any[]>((resolve, reject) => {
      connection.query(
        'SELECT id FROM people WHERE id=?',
        [peopleId],
        (err, resp) => {
          if (err) {
            reject(err)
          } else {
            resolve(resp)
          }
        }
      )
    })
    if (promiseResponse.length === 0) {
      throw new Error(`Record with id ${peopleId} doesn't exists in people`)
    }

    const hierarchicalData = await getHierarchy({ personID: parseInt(peopleId) })
    res.status(200).send(hierarchicalData)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}

export const allPeopleUndeGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params
    const { firstNameFilter, jobFilter } = req.query
    const connection = await ConncetionDB()
    const promiseResponse = await new Promise<any[]>((resolve, reject) => {
      connection.query(
        'SELECT id FROM organization.groups WHERE id=?',
        [groupId],
        (err, resp) => {
          if (err) {
            reject(err)
          } else {
            resolve(resp)
          }
        }
      )
    })
    if (promiseResponse.length === 0) {
      throw new Error(`Record with id ${groupId} doesn't exists in groups`)
    }
    
    const groups = await getRecursiveGroups(connection, parseInt(groupId))
    const groupIDs = groups.map(group => group.id)
    groupIDs.push(parseInt(groupId))

    let queryStatement = 'SELECT * FROM people WHERE parent_group_id IN (?)'
    if (firstNameFilter) {
      queryStatement += ` AND first_name LIKE '%${firstNameFilter}%'`
    }
    if (jobFilter) {
      queryStatement += ` AND job LIKE '%${jobFilter}%'`
    }
    const peopleResponse = await new Promise<any[]>((resolve, reject) => {
      connection.query(
        queryStatement,
        [groupIDs],
        (err, resp) => {
          if (err) {
            reject(err)
          } else {
            resolve(resp)
          }
        }
      )
    })

    res.status(200).send(peopleResponse)
  } catch (error) {
    res.status(500).send(error?.message ?? error)
  }
}
