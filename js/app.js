/**
 * Sanctum - Neo Build
 * Core application logic
 */

const API = {
    baseUrl: '/api',

    async fetch(endpoint, options = {}) {
        const url = this.baseUrl + endpoint;
        const config = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return response.json();
    },

    async getUserInfo() {
        return this.fetch('/userinfo');
    },

    async getOrders() {
        const data = await this.fetch('/orders');
        return data.orders || [];
    },

    async getOrder(orderId) {
        return this.fetch(`/orders/${orderId}`);
    },

    async getTalkRooms() {
        return this.fetch('/talk/rooms');
    },

    async getChatMessages(roomToken, limit = 50) {
        return this.fetch(`/talk/rooms/${roomToken}/messages?limit=${limit}`);
    },

    async sendChatMessage(roomToken, message) {
        return this.fetch(`/talk/rooms/${roomToken}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    },

    async getCalendarEvents(calendarUri) {
        return this.fetch(`/calendar/${calendarUri}/events`);
    },

    async getFiles(folderId) {
        return this.fetch(`/files/${folderId}`);
    }
};

const State = {
    user: null,
    orders: [],
    currentOrder: null,

    async init() {
        try {
            this.user = await API.getUserInfo();
            this.orders = await API.getOrders();
            return true;
        } catch (e) {
            console.error('Failed to initialize:', e);
            return false;
        }
    },

    getUserOrders() {
        if (!this.user) return [];
        return this.orders.filter(order =>
            order.members && order.members.includes(this.user.username)
        );
    },

    getOrderById(orderId) {
        return this.orders.find(o => o.id === orderId);
    }
};

const UI = {
    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    },

    show(el) {
        if (typeof el === 'string') el = this.$(el);
        if (el) el.classList.remove('hidden');
    },

    hide(el) {
        if (typeof el === 'string') el = this.$(el);
        if (el) el.classList.add('hidden');
    },

    setLoading(container, loading = true) {
        if (typeof container === 'string') container = this.$(container);
        if (!container) return;
        if (loading) {
            container.innerHTML = '<div class="loading">Loading</div>';
        }
    },

    setEmpty(container, message = 'Nothing here yet') {
        if (typeof container === 'string') container = this.$(container);
        if (!container) return;
        container.innerHTML = `<div class="empty-state">${message}</div>`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
    },

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const initialized = await State.init();
    if (!initialized) {
        console.error('Failed to initialize app');
        return;
    }
    if (typeof App !== 'undefined' && App.init) {
        App.init();
    }
});
