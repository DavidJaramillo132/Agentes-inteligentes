import { Routes } from "@angular/router";
import { Home } from "./pages/home/home";
import { Login } from "../login/pages/login/login";
import { Register } from "../login/pages/register/register";
import { AuthGuard } from "../../shared/guards/auth.guard";
import { NoAuthGuard } from "../../shared/guards/no-auth.guard";

export const siteRoutes :Routes= [
    {
        path: 'login',
        component: Login,
        canActivate: [NoAuthGuard] // Solo accesible si NO está logueado
    },
    {
        path: 'register',
        component: Register,
        canActivate: [NoAuthGuard] // Solo accesible si NO está logueado
    },
    {
        path: 'agents',
        component: Home,
        canActivate: [AuthGuard] // Solo accesible si está logueado
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    // IMPORTANTE: El wildcard debe ir al FINAL de todas las rutas
    {
        path: '**',
        redirectTo: '/login'
    },

];