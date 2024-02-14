import { Router } from 'express';
import { createGroup, deleteGroup, editGroup, moveGroupToAnotherGroup } from '../controllers/groups';

export const groupsRoute = Router();

groupsRoute.post('/', createGroup);
groupsRoute.put('/:id', editGroup);
groupsRoute.delete('/:id', deleteGroup);
groupsRoute.patch('/move/:id', moveGroupToAnotherGroup);
