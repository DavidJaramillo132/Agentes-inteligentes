import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-chat-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './chat-button.html'
})
export class ChatButtonComponent {
    @Input() icon: string = 'M12 4v16m8-8H4'; // SVG path por defecto
    @Input() text: string = 'Button';
    
    // Evento para manejar clicks
    @Output() buttonClick = new EventEmitter<void>();
    
    onButtonClick(): void {
        this.buttonClick.emit();
    }
}