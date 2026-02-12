import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterModule, CommonModule],
    styleUrls: ['./login.css'],
    templateUrl: './login.html'
})
export class Login {
    username: string = '';
    password: string = '';
    isLoading: boolean = false;


    constructor(private router: Router, private http: HttpClient) { }

    // Generar user ID basado en el email
    private generateUserId(email: string): string {
        const timestamp = Date.now();
        const emailHash = btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
        return `user_${emailHash}_${timestamp}`;
    }

    login(): void {
        if (!this.validaciones_login()) {
            return;
        }

        this.isLoading = true;
        
        const payload = {
            email: this.username,
            password: this.password
        };

        this.http.post(environment.baseUrl + '/auth/login', payload)
            .pipe(
                finalize(() => {
                    // Esto SIEMPRE se ejecuta al finalizar
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (res: any) => {
                    // Guardar información del usuario en localStorage
                    const userInfo = {
                        email: this.username,
                        userId: res.user?.id || res.user?._id || this.generateUserId(this.username),
                        loginTime: Date.now(),
                        accessToken: res.access_token?.access_token
                    };

                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('accessToken', res.access_token?.access_token || '');

                    alert('Usuario logueado correctamente');
                    this.router.navigate(['/agents']);
                },
                error: (err) => {
                    alert('Error al iniciar sesión: ' + (err.error?.detail || err.message));
                }
            });
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