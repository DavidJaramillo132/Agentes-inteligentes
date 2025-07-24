import { Routes } from "@angular/router";
import { Home } from "./pages/home/home";
import { Login } from "../login/pages/login/login";
import { Register } from "../login/pages/register/register";
import { log } from "node:console";

export const siteRoutes :Routes= [
    {
        path: 'login',
        component: Login
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'agents',
        component: Home
    },
    {
        path: '',
        component: Login,
    }

];