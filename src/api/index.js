import axios from '@/utils/index'

export function getIndexData(params) {
    return axios({
        url: '/index',
        method: 'get',
        params
    })
}

export function getAlertSummary(params) {
    return axios({
        url: '/summary',
        method: 'get',
        params
    })
}

export function getAudio(params) {
    return axios({
        url: '/audio',
        method: 'get',
        params,
        responseType: 'blob'
    })
}

export function updateAlertSummary(data) {
    return axios({
        url: '/summary',
        method: 'put',
        data
    })
}

export function setAlertOwner(data) {
    return axios({
        url: '/summary',
        method: 'patch',
        data
    })
}

export function getAlertRule(params) {
    return axios({
        url: '/alert_rule',
        method: 'get',
        params
    })
}

export function getChatGroups(params) {
    return axios({
        url: '/alert_rule/opt',
        method: 'get',
        params
    })
}

export function setConfig(data) {
    return axios({
        url: '/alert_rule/opt',
        method: 'put',
        data
    })
}

export function addAlertRule(data) {
    return axios({
        url: '/alert_rule/opt',
        method: 'post',
        data
    })
}

export function updateAlertRule(data) {
    return axios({
        url: '/alert_rule',
        method: 'put',
        data
    })
}

export function deleteAlertRule(data) {
    return axios({
        url: '/alert_rule',
        method: 'delete',
        data
    })
}

export function deployAlertRule(data) {
    return axios({
        url: '/alert_rule/opt',
        method: 'put',
        data
    })
}

export function exportAlertRule(data) {
    return axios({
        url: '/alert_rule',
        method: 'patch',
        data
    })
}

export function importAlertRule(data) {
    return axios({
        url: '/alert_rule',
        method: 'post',
        data
    })
}

export function getAlertPlatform(params) {
    return axios({
        url: '/integrate',
        method: 'get',
        params: params
    })
}

export function addAlertPlatform(data) {
    return axios({
        url: '/integrate',
        method: 'post',
        data
    })
}

export function updateAlertPlatform(data) {
    return axios({
        url: '/integrate',
        method: 'put',
        data
    })
}

export function healthcheck(params) {
    return axios({
        url: '/integrate/healthcheck',
        method: 'get',
        params
    })
}

export function getLabelsAnno(params) {
    return axios({
        url: '/label_annos',
        method: 'get',
        params
    })
}

export function addLabelsAnno(data) {
    return axios({
        url: '/label_annos',
        method: 'post',
        data
    })
}

export function updateLabelsAnnoSetting(data) {
    return axios({
        url: '/label_annos',
        method: 'put',
        data
    })
}

export function delAlertPlatform(params) {
    return axios({
        url: '/integrate',
        method: 'delete',
        params
    })
}

export function getAuditLog(params) {
    return axios({
        url: '/log',
        method: 'get',
        params
    })
}
