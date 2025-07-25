import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './register.html'
})
export class Register {
    username: string = '';
    email: string = '';
    password: string = '';
    confirmPassword: string = '';

    constructor(private router: Router) {}

    registrar(): void {
        if(this.validaciones_register()) {
            alert(`Intentando registrar:\nUsuario: ${this.username}\nEmail: ${this.email}\nContraseña: ${this.password}`);
            this.router.navigate(['/agents']);
        }

    }

    validaciones_register(): boolean {
                if(!this.username || !this.password || !this.email || !this.confirmPassword) {
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
        if(this.password !== this.confirmPassword){
            alert('Las contraseñas no coinciden.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(this.email)){
            alert('Por favor, ingrese un correo electrónico válido.');
            return false;
        }

        return true;
    }


    


}