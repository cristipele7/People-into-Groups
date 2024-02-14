import { Router } from 'express';
import { allGroupsAbovePerson, allPeopleUndeGroup, cacheHierarchy, hierarchy } from '../controllers/service';

export const serviceRoute = Router();

serviceRoute.get('/hierarchy', cacheHierarchy, hierarchy);
serviceRoute.get('/groups-above-person/:peopleId', allGroupsAbovePerson);
serviceRoute.get('/people-under-group/:groupId', allPeopleUndeGroup);
