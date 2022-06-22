import axios from '../plugins/axios';
import config from '../../app.config';
import { defineStore } from 'pinia'


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useUserStore = defineStore('user', {
    // other options...
    state: () => {
        return {
            loggedIn: false,
            username: null,
            date: null,
            email: null,

        }
    },
    actions: {
        async getCSRFToken() {
            return axios.get(`${config.API_LOCATION}/user/csrf`, {
                withCredentials: true
            })
                .then(() => {
                    const csrftoken = getCookie('csrftoken');
                    if (this.csrfToken !== csrftoken) {
                        this.csrfToken = csrftoken;
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        async getUserData() {
            return axios.post(`${config.API_LOCATION}/user/get`)
                .then((res) => {
                    if (res.data.status === 'ok') {
                        if ("username" in res.data.data) {
                            this.username = res.data.data.username;
                        }
                        if ("email" in res.data.data) {
                            this.email = res.data.data.email;
                        }
                        if ("date" in res.data.data) {
                            this.date = res.data.data.date;
                        }
                        this.loggedIn = true;
                    }
                    else {
                        this.username = null;
                        this.email = null;
                        this.loggedIn = false;
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        },

        async login(params) {
            // commit('loading/update', true, { root: true });
            let info = { date: Date(), origin: 'login' };
            return axios.post(`${config.API_LOCATION}/user/login`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        if ("username" in res.data.data) {
                            this.username = res.data.data.username;
                        }
                        if ("email" in res.data.data) {
                            this.email = res.data.data.email;
                        }
                        if ("date" in res.data.data) {
                            this.date = res.data.data.date;
                        }
                        this.loggedIn = true;
                        return true;
                    } else {

                        // commit('error/update', info, { root: true });
                        return false;
                    }
                })
            // .catch((error) => {
            //     return false;
            //     // commit('error/update', { ...info, error }, { root: true });
            // })
            // .finally(() => {
            //   commit('loading/update', false, { root: true });
            // });
        },
        async logout() {
            const params = { username: this.username };
            // commit('loading/update', true, { root: true });
            return axios.post(`${config.API_LOCATION}/user/logout`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        this.username = null;
                        this.email = null;
                        this.date = null;
                        this.loggedIn = false;
                        return true;
                    }
                })
            // .catch((error) => {
            //     const info = { date: Date(), error, origin: 'logout' };
            //     commit('error/update', info, { root: true });
            //     return false;
            // })
            // .finally(() => {
            //   commit('loading/update', false, { root: true });
            // });
        },
        async register(params) {
            // commit('loading/update', true, { root: true });
            let info = { date: Date(), origin: 'register' };
            return axios.post(`${config.API_LOCATION}/user/register`, { params })
                .then((res) => {
                    if (res.data.status === 'ok') {
                        // if ("username" in res.data.data) {
                        //     this.username = res.data.data.username;
                        // }
                        // if ("email" in res.data.data) {
                        //     this.email = res.data.data.email;
                        // }
                        // this.loggedIn = true;
                        this.getUserData();
                    } else {
                        commit('error/update', info, { root: true });
                    }
                })
            // .catch((error) => {
            //     commit('error/update', { ...info, error }, { root: true });
            // })
            // .finally(() => {
            //   commit('loading/update', false, { root: true });
            // });
        },
    },
    persist: true,
})