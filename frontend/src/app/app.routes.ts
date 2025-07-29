import { Routes } from '@angular/router';
import { siteRoutes } from './modules/site/site.routes';
import { chatRoutes } from './modules/chat/chat.routes';

export const routes: Routes = [...chatRoutes, ...siteRoutes];
