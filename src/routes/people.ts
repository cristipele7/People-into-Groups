import { Router } from 'express';
import { createInPeople, deleteInPeople, editInPeople, movePeopleToAnotherGroup } from '../controllers/people';

export const peopleRoute = Router();

peopleRoute.post('/', createInPeople);
peopleRoute.put('/:id', editInPeople);
peopleRoute.delete('/:id', deleteInPeople);
peopleRoute.patch('/move/:id', movePeopleToAnotherGroup);
