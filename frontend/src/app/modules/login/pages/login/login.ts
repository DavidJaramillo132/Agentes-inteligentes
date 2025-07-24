import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterModule],
    templateUrl: './login.html'
})
export class Login {
    username: string = '';
    password: string = '';

    constructor(private router: Router) {}

    login(): void {
        alert(`Intentando iniciar sesión con:\nUsuario: ${this.username}\nContraseña: ${this.password}`);
        if (this.validaciones_login()){
            this.router.navigate(['/agents']);
        }else{
            alert('validaciones fallidas');
        }
    }

    validaciones_login(): boolean {
        if(!this.username || !this.password) {
            alert('Por favor, complete todos los campos.');
            return false;
        }
        if(this.username.length < 3 || this.username.length > 20) {
            alert('El nombre de usuario debe tener entre 3 y 20 caracteres.');
            return false;
        }
        if(this.password.length < 6 || this.password.length > 20) {
            alert('La contraseña debe tener entre 6 y 20 caracteres.');
            return false;
        }
        return true;
    }
}