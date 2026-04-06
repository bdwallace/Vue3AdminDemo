import axios from '@/utils/index'

export function getAlertSilence(params) {
    return axios({
        url: '/silence',
        method: 'get',
        params
    })
}

export function addAlertSilence(data) {
    return axios({
        url: '/silence',
        method: 'post',
        data
    })
}

export function updateSilenceStatus(data) {
    return axios({
        url: '/silence',
        method: 'put',
        data
    })
}

export function getCycleSilence(params) {
    return axios({
        url: '/silence/cycle',
        method: 'get',
        params
    })
}

export function editSilenceItem(data) {
    return axios({
        url: '/silence',
        method: 'patch',
        data
    })
}

export function addCycleSilence(data) {
    return axios({
        url: '/silence/cycle',
        method: 'post',
        data
    })
}

export function addAdvanceSilence(data) {
    return axios({
        url: '/silence/advance',
        method: 'post',
        data
    })
}
export function updateCycleSilenceStatus(data) {
    return axios({
        url: '/silence/cycle',
        method: 'put',
        data
    })
}

export function editCycleSilenceItem(data) {
    return axios({
        url: '/silence/cycle',
        method: 'patch',
        data
    })
}

export function deleteCycleSilenceItem(data) {
    return axios({
        url: '/silence/cycle',
        method: 'delete',
        data
    })
}
