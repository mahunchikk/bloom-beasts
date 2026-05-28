const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'                  
    : 'https://bloom-beasts.onrender.com/api'; 

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка запроса');
        }
        return data;
    }

    async register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { username, email, password }
        });
    }

    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { username, password }
        });
    }

    async getProfile() {
        return this.request('/auth/profile', { method: 'GET' });
    }

    async rollSingle() {
        return this.request('/gacha/roll-single', { method: 'POST' });
    }

    async rollMulti() {
        return this.request('/gacha/roll-multi', { method: 'POST' });
    }

    async updateQuestProgress(type, increment) {
        try {
            return await this.updateQuest(type, increment);
        } catch (error) {
            console.log('Ошибка обновления квеста:', error);
        }
    }

    async getUserCharacters() {
        return this.request('/characters', { method: 'GET' });
    }

    async getAllCharacters() {
        return this.request('/characters/all', { method: 'GET' });
    }

    async upgradeCharacter(characterId) {
        return this.request(`/character/upgrade/${characterId}`, { 
            method: 'POST' 
        });
    }

    async getStages() {
        return this.request('/characters/stages', { method: 'GET' });
    }

    async startBattle(stageId, teamIds, isWin) {
        return this.request('/characters/battle', {
            method: 'POST',
            body: { stageId, teamIds, isWin }
        });
    }
    async upgradeCharacterLevel(characterId) {
        return this.request(`/characters/upgrade-level/${characterId}`, {
            method: 'POST'
        });
    }

    async upgradeCharacterSkill(characterId) {
        return this.request(`/characters/upgrade-skill/${characterId}`, {
            method: 'POST'
        });
    }



    async addQuestRewards(rewards) {
        return this.request('/characters/add-quest-rewards', {
            method: 'POST',
            body: rewards
        });
    }

    async getQuests() {
        return this.request('/quests', { method: 'GET' });
    }

    async updateQuest(type, increment) {
        return this.request('/quests/update', {
            method: 'POST',
            body: { type, increment }
        });
    }

    async addRewards(rewards) {
        return this.request('/auth/add-rewards', {
            method: 'POST',
            body: rewards
        });
    }

    async getInteractiveState() {
    return this.request('/auth/interactive-state', { method: 'GET' });
    }

    async claimInteractive(type) {
        return this.request('/auth/interactive-claim', {
            method: 'POST',
            body: { type }
        });
    }
}

const api = new ApiClient();
export default api;