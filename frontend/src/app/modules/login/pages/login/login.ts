import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterModule],
    templateUrl: './login.html'
})
export class Login {
    username: string = '';
    password: string = '';

    constructor(private router: Router, private http: HttpClient) { }

    login(): void {
        if(this.validaciones_login()) {
            const payload = {
                email: this.username,
                password: this.password
            };
            console.log('Enviando login:', payload);
            this.http.post('http://localhost:8000/auth/login', payload)
                .subscribe({
                    next: (res) => {
                        alert('Usuario logueado correctamente');
                        this.router.navigate(['/agents']);
                    },
                    error: (err) => {
                        alert('Error al iniciar sesión: ' + (err.error?.detail || err.message));
                    }
                });
        }
    }

    validaciones_login(): boolean {
        if (!this.username || !this.password) {
            alert('Por favor, complete todos los campos.');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.username)) {
            alert('Por favor, ingrese un correo electrónico válido.');
            return false;
        }
        if (this.password.length < 6 || this.password.length > 20) {
            alert('La contraseña debe tener entre 6 y 20 caracteres.');
            return false;
        }
        return true;
    }
}