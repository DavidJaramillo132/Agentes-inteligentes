import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { adaptAgent, adaptAgents } from '../adapters/agent-adapter';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class AgentDataService {
  constructor(private http: HttpClient) {}
  private agentsDirectUrl = environment.agentsDirectUrl;

  getAgents() {
    return httpResource(() => this.agentsDirectUrl, {
      parse: (response: any) => {
        console.log(response);
        return adaptAgents(response);
      },
    });
  }

}
