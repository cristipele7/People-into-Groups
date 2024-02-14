import { Router } from 'express';
import { allForGroup, allGroupsAbovePerson, cacheHierarchy, hierarchy } from '../controllers/service';

export const serviceRoute = Router();

serviceRoute.get('/hierarchy', cacheHierarchy, hierarchy);
serviceRoute.get('/groups-above-person/:peopleId', allGroupsAbovePerson);
serviceRoute.get('/group/:groupId', allForGroup);
