import * as actionTypes from '../actionTypes'
import axios from 'axios'
import { createBrowserHistory } from 'history'
import getRequestData from '../../util/RequestData'
import {
  getAvoidedEmissions,
  getCarbonAttribution,
  getDisclosureData,
  getPortfolioEmission,
  getSovereignFootprint,
  getDownloadDetails
} from './footprintActions'
import { getScope3Data } from './scope3Actions'
import {
  getPortOptimizationData,
  getPerformanceAttrData,
} from './optimizationActions'
import { getRiskContributorData } from './riskContributionActions'
import { getCoalPowerData, getFossilFuelData } from './strandedAssetActions'
import {
  getTempScoreData,
  getCompanyAnalysisData,
  getTempAttribution,
  getContribAnalysis,
  getHeatmapData,
  getSectoralTempScore,
} from './tempMetricActions'
import {
  getPortfolioAlignment,
  getTargetSetting,
  getCompanyProfileData,
  getCompanies,
  getCarbonCompanies,
  getCarbonReturnsLineData,
  getCarbonReturnsTableData,
} from './flmActions'
import { getAlignment, getSummary,getFootprint,getFundTargetSetting } from './fundOfFundActions'
import { NotificationManager } from 'react-notifications'

const history = createBrowserHistory()

const requestApi = async (dispatch, auth, flm) => {
  const moduleName = auth.moduleName
  const tabValue = auth.tabValue
  const companyData = flm.companyData
  const {allPortfolios,currentPortfolio,currentFundsPortfolio} = auth

  console.log("result..",currentFundsPortfolio)
  let data = {}

  let childrenIds=[]
  let result = []
  if(allPortfolios && allPortfolios.length > 0){
      allPortfolios.map(portfolio=>{
          if(portfolio.portfolio_id === currentFundsPortfolio.value ){
               childrenIds = portfolio.children_id
          }
      })
  }
  if(childrenIds && childrenIds .length > 0){
      childrenIds.map(id=>{
          allPortfolios.map(portfolio=>{
              if(portfolio.id === id ){
                  result.push(portfolio.portfolio_id)
              }
          })
      })
  }

  switch (moduleName) {
    case 'Emissions':
      switch (tabValue) {
        case 0:
          data = getRequestData('PORTFOLIO_EMISSION', auth)
          await dispatch(getPortfolioEmission(data))
          break
        case 1:
          data = getRequestData('CARBON_EMISSION', auth)
          await dispatch(getPortfolioEmission(data))
          break
        case 2:
          data = getRequestData('SOVEREIGN_FOOTPRINT', auth)
          await dispatch(getSovereignFootprint(data))
          break
        case 3:
          data = getRequestData('CARBON_ATTRIBUTION', auth)
          await dispatch(getCarbonAttribution(data))
          break
        case 4:
          const portData = getRequestData('PORT_DISCLOSURE', auth)
          const benchData = getRequestData('BENCH_DISCLOSURE', auth)

          await dispatch(getDisclosureData(portData, 'portfolio'))
          await dispatch(getDisclosureData(benchData, 'benchmark'))

          break
        case 5:
          data = getRequestData('AVOIDED_EMISSION', auth)
          await dispatch(getAvoidedEmissions(data))
          break
        default:
          data = getRequestData('PORTFOLIO_EMISSION', auth)
          await dispatch(getPortfolioEmission(data))
          break
      }
      break
    case 'Scope3':
      switch (tabValue) {
        case 0:
          data = getRequestData('SCOPE3_MATERILITY', auth)
          await dispatch(getScope3Data(data))
          break
        case 1:
          data = getRequestData('SECTORAL_SCOPE3_MATERILITY', auth)
          await dispatch(getScope3Data(data))
          break
        default:
          data = getRequestData('SCOPE3_MATERILITY', auth)
          await dispatch(getScope3Data(data))
          break
      }
      break
    case 'Fund Of Funds':
      switch (tabValue) {
        case 0:
          await dispatch(getSummary(result.join(',')))
          break
          case 1:
          const reData = getRequestData('PORTFOLIO_EMISSION', auth)
          reData.portfolio_id = [...result,currentFundsPortfolio.value]
          delete reData.benchmark_id
          delete reData.version_benchmark
          await dispatch(getFootprint(reData))
          break
        case 2:
          const requestData = getRequestData('PORTFOLIO_ALIGNMENT', auth)
          requestData.portfolio_id = [...result,currentFundsPortfolio.value]
          delete requestData.benchmark_id
          delete requestData.version_benchmark
          await dispatch(getAlignment(requestData))
          break
          case 3:
          const resData = getRequestData('TARGET_SETTING', auth)
          resData.portfolio_id = [...result]
          delete resData.benchmark_id
          delete resData.version_benchmark
          await dispatch(getFundTargetSetting(resData))
          break
        default:
          await dispatch(getSummary(result.join(',')))
          break
      }
      break
    case 'FLM':
      switch (tabValue) {
        case 0:
          data = getRequestData('PORTFOLIO_ALIGNMENT', auth)
          await dispatch(getPortfolioAlignment(data))
          break
        case 1:
          data = getRequestData('TARGET_SETTING', auth)
          await dispatch(getTargetSetting(data))
          break
        case 2:
          data = getRequestData('COMPANY_PROFILE_COMPANIES', auth)
          const response= await dispatch(getCompanies(data))

          if (response && Object.keys(response).length > 0) {
            const sectors = Object.keys(response)
            const companies = response[sectors[0]]
            const currentCompany = companies[0]['company_id']
            let requestData = getRequestData('COMPANY_PROFILE', auth)

            requestData = {
              ...requestData,
              isin: currentCompany,
            }
            await dispatch(getCompanyProfileData(requestData))
          }

          break
        case 3:
          data = getRequestData('CARBON_ADJUSTED_COMPANIES', auth)
          const result = await dispatch(getCarbonCompanies(data))
          if (result && Object.keys(result).length > 0) {
            const sectors = Object.keys(result)
            const companies = result[sectors[0]]
            const company = companies[0]

            let lineChartData = getRequestData(
              'CARBON_ADJUSTED_LINE_RETURNS',
              auth,
            )
            let tableData = getRequestData(
              'CARBON_ADJUSTED_TABLE_RETURNS',
              auth,
            )

            lineChartData = {
              ...lineChartData,
              isin: company['company_id'],
              ticket: company['ticket'],
            }
            tableData = {
              ...tableData,
              isin: company['company_id'],
              ticket: company['ticket'],
            }
            await dispatch(getCarbonReturnsLineData(lineChartData))
            await dispatch(getCarbonReturnsTableData(tableData))
          }

          break
          // await dispatch(getCarbonReturns(data));
          break
        default:
          data = getRequestData('PORTFOLIO_ALIGNMENT', auth)
          await dispatch(getPortfolioAlignment(data))
          break
      }
      break
    case 'Optimization':
      switch (tabValue) {
        case 0:
          data = getRequestData('PORTFOLIO_OPTIMIZATION', auth)
          await dispatch(getPortOptimizationData(data))
          break
          case 1:
            data = getRequestData('PORTFOLIO_OPTIMIZATION', auth)
            await dispatch(getPortOptimizationData(data))
            break
        case 2:
          data = getRequestData('PERFORMANCE_ATTRIBUTION', auth)
          await dispatch(getPerformanceAttrData(data))
          break
        default:
          data = getRequestData('PORTFOLIO_OPTIMIZATION', auth)
          await dispatch(getPortOptimizationData(data))
          break
      }
      break
    case 'Carbon risk':
      switch (tabValue) {
        case 0:
          data = getRequestData('RISK_CONTRIBUTOR', auth)
          await dispatch(getRiskContributorData(data))
          break
        default:
          data = getRequestData('RISK_CONTRIBUTOR', auth)
          await dispatch(getPortOptimizationData(data))
          break
      }
      break
    case 'Stranded':
      switch (tabValue) {
        case 0:
          data = getRequestData('FOSSIL_FUEL', auth)
          await dispatch(getFossilFuelData(data))
          break
        default:
          data = getRequestData('COAL_POWER', auth)
          await dispatch(getCoalPowerData(data))
          break
      }
      break
    case 'Temp score':
      switch (tabValue) {
        case 0:
          data = getRequestData('PORT_TEMPERATURE_SCORE', auth)
          await dispatch(getTempScoreData(data))
          break
        case 1:
          data = getRequestData('COMPANY_ANALYSIS', auth)
          await dispatch(getCompanyAnalysisData(data))
          break
        case 2:
          data = getRequestData('TEMP_ATTRIBUTION', auth)
          await dispatch(getTempAttribution(data))
          break
        case 3:
          data = getRequestData('SECTORAL_TEMP_SCORE', auth)
          await dispatch(getSectoralTempScore(data))
          break
        case 4:
          data = getRequestData('CONTRIBUTION_ANALYSIS', auth)
          await dispatch(getContribAnalysis(data))
          break
        case 5:
          data = getRequestData('TEMP_HEATMAP', auth)
          await dispatch(getHeatmapData(data))
          break
        default:
          data = getRequestData('PORT_TEMPERATURE_SCORE', auth)
          await dispatch(getTempScoreData(data))
          break
      }
      break
    default:
      switch (tabValue) {
        case 0:
          data = getRequestData('PORTFOLIO_EMISSION', auth)
          await dispatch(getPortfolioEmission(data))
          break
        case 1:
          data = getRequestData('CARBON_EMISSION', auth)
          await dispatch(getPortfolioEmission(data))
          break
        case 2:
          data = getRequestData('SOVEREIGN_FOOTPRINT', auth)
          await dispatch(getSovereignFootprint(data))
          break
        case 3:
          data = getRequestData('CARBON_ATTRIBUTION', auth)
          await dispatch(getCarbonAttribution(data))
          break
        case 4:
          data = getRequestData('DISCLOSURE', auth)
          await dispatch(getDisclosureData(data))
          break
        case 5:
          data = getRequestData('AVOIDED_EMISSION', auth)
          await dispatch(getAvoidedEmissions(data))
          break
        default:
          data = getRequestData('PORTFOLIO_EMISSION', auth)
          await dispatch(getPortfolioEmission(data))
          break
      }
      break
  }
}
export const signinUser = (data) => {
  return async (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_URL}/user/sign_in`, data)
      .then(async (result) => {
        const userDetails ={
          ...result.data,
          userName : data.user_name
        }
        await dispatch(signinUserSuccess(userDetails))
        localStorage.setItem('auth',result.data.currentUser)
        if(result.data.warning){
          NotificationManager.warning(result.data.warning)
        }
        history.push('/')
      })
      .catch(err=>{
        const error=err.response && err.response.data.message
        throw new Error(error)
      })
  }
}

export const signinUserSuccess = (currentUser) => {
  return { type: actionTypes.SIGNIN_USER_SUCCESS, currentUser }
}


export const verifyUser = (data) => {
  return async (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_URL}/accounts/reset_password`, data)
      .then((result) => {
        if (result.data.success) {
          dispatch(verifyUserSuccess(result.data))
        } else {
          const error = result.data.message
          throw new Error(error)
        }
      })
  }
}

export const verifyUserSuccess = (res) => {
  return { type: actionTypes.VERIFY_USER_SUCCESS, res }
}

export const getPortfolioList = (client) => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
    }
    return axios
      .get(`${process.env.REACT_APP_API_URL}/portfolio/`, { headers: headers })
      .then((result) => {
        dispatch(getPortfolioListSuccess(result.data))
      })
      .catch(() => {
        dispatch(getPortfolioListFailure())
      })
  }
}

export const getPortfolioListSuccess = (res) => {
  return { type: actionTypes.GET_PORTFOLIO_LIST_SUCCESS, res }
}

export const getPortfolioListFailure = () => {
  return { type: actionTypes.GET_PORTFOLIO_LIST_FAILURE }
}


export const getFundsPortfolioList = () => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
    }
    return axios
      .get(`${process.env.REACT_APP_API_URL}/portfolio/?portfolio_type=PC&is_full=true`, { headers: headers })
      .then((result) => {
        dispatch(getFundsPortfolioListSuccess(result.data))
        let list = result && result.data.length > 0 ? result.data : []

        let fundsData={}
        let res = []
        if (list && list.length > 0) {
           list.map((portfolio) => {
            if(portfolio.is_parent){
                res.push({
                    label: portfolio.name,
                    value: portfolio.portfolio_id,
                    version: portfolio.version,
                })
            }
          })
        }

         fundsData = {
          label: res.length > 0 ? res[0].label : '',
          value: res.length > 0 ? res[0].value : '',
          version: res.length > 0 ? res[0].version : '',
        }

        return {list,fundsData}
      })
      .catch((error) => {
        dispatch(getFundsPortfolioListFailure())
      })
  }
}

export const getFundsPortfolioListSuccess = (res) => {
  return { type: actionTypes.GET_FUNDS_PORTFOLIO_LIST_SUCCESS, res }
}

export const getFundsPortfolioListFailure = () => {
  return { type: actionTypes.GET_FUNDS_PORTFOLIO_LIST_FAILURE }
}

export const getUserInfo = () => {
  return async (dispatch,getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .get(`${process.env.REACT_APP_API_URL}/user/info`,{
        headers:{
          'Authorization': `Bearer ${accessToken}`,
        }
      })
      .then((result) => {
          dispatch(getUserInfoSuccess(result.data))
      })
     
  }
}

export const getUserInfoSuccess = (res) => {
  return { type: actionTypes.GET_USER_INFO, res }
}
export const updateUserInfo = (data) => {
  return async (dispatch,getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .put(`${process.env.REACT_APP_API_URL}/user/info`,data,{
        headers:{
          'Authorization': `Bearer ${accessToken}`,
        }
      })
  }
}

export const getUploadPortfolioList = () => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .get(`${process.env.REACT_APP_API_URL}/portfolio/?is_full=True&short=False`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
         },
      })
      .then((result) => {
        dispatch(getUploadPortfolioListSuccess(result.data))
      })
      .catch((error) => {
        dispatch(getUploadPortfolioListFailed())
      })
  }
}

export const getUploadPortfolioListSuccess = (res) => {
  return { type: actionTypes.GET_UPLOAD_PORTFOLIO_LIST_SUCCESS, res }
}
export const getUploadPortfolioListFailed = (res) => {
  return { type: actionTypes.GET_UPLOAD_PORTFOLIO_LIST_FAILED, res }
}

export const updateCurrency = (data) => {
  return async (dispatch) => {
    dispatch(updateCurrencySuccess(data))
  }
}

export const updateCurrencySuccess = (res) => {
  return { type: actionTypes.UPDATE_CURRENCY_SUCCESS, res }
}
export const updateCurrencyFailed = (res) => {
  return { type: actionTypes.UPDATE_CURRENCY_FAILED, res }
}

export const setPortfolio = (portfolio) => {
  return async (dispatch, getState) => {
    await dispatch(setPortfolioSuccess(portfolio))
    const auth = getState().auth
    const flm = getState().flm
    requestApi(dispatch, auth, flm)
  }
}
export const setFundsPortfolio = (portfolio) => {
  console.log("portfolio//",portfolio)
  return async (dispatch, getState) => {
    await dispatch(setFundsPortfolioSuccess(portfolio))
    const auth = getState().auth
    const flm = getState().flm
    requestApi(dispatch, auth, flm)
  }
}

export const setPortfolioSuccess = (res) => {
  return { type: actionTypes.SET_PORTFOLIO, res }
}
export const setFundsPortfolioSuccess = (res) => {
  return { type: actionTypes.SET_FUNDS_PORTFOLIO, res }
}
export const setBenchmark = (benchmark) => {
  return async (dispatch, getState) => {
    await dispatch(setBenchmarkSuccess(benchmark))
    const auth = getState().auth
    const flm = getState().flm
    requestApi(dispatch, auth, flm)
  }
}

export const setBenchmarkSuccess = (res) => {
  return { type: actionTypes.SET_BENCHMARK, res }
}

export const setFilterItem = (data) => {
  return async (dispatch, getState) => {
    await dispatch(setFilterItemSuccess(data))
    const auth = getState().auth
    const flm = getState().flm
    requestApi(dispatch, auth, flm)
  }
}

export const setFilterItemSuccess = (res) => {
  return { type: actionTypes.SET_FILTER_ITEM, res }
}
export const setLogin = () => {
  return async (dispatch) => {
    history.push('/login')
    localStorage.setItem('version',process.env.REACT_APP_VERSION)
  }
}
export const setTabValue = (value) => {
  return async (dispatch) => {
    dispatch(setTabValueSuccess(value))
  }
}


export const setTabValueSuccess = (res) => {
  return { type: actionTypes.SET_TAB_SUCCESS, res }
}
export const setModule = (value) => {
  return async (dispatch) => {
    await dispatch(setModuleSuccess(value))
  }
}

export const setModuleSuccess = (res) => {
  return { type: actionTypes.SET_MODULE_SUCCESS, res }
}

export const setFilterVisibility = (value) => {
  return async (dispatch) => {
    dispatch(setFilterVisibilitySuccess(value))
  }
}

export const setFilterVisibilitySuccess = (res) => {
  return { type: actionTypes.SET_FILTER_VISIBILITY, res }
}
export const setReweightData = (value) => {
  return async (dispatch, getState) => {
    await dispatch(setReweightDataSuccess(value))
    const auth = getState().auth
    const data = getRequestData('PORTFOLIO_OPTIMIZATION', auth)
    await dispatch(getPortOptimizationData(data))
  }
}

export const setReweightDataSuccess = (res) => {
  return { type: actionTypes.SET_REWEIGHT_FACTOR, res }
}

export const setLoading = (value) => {
  return async (dispatch) => {
    dispatch(setLoadingSuccess(value))
  }
}

export const setLoadingSuccess = (res) => {
  return { type: actionTypes.SET_LOADING, res }
}

export const logoutUser = () => {   
    return async (dispatch,getState) => {
      const accessToken = getState().auth.currentUser.access_token

      return axios
        .post(`${process.env.REACT_APP_API_URL}/user/sign_out`,{},{
          headers:{
            'Authorization': `Bearer ${accessToken}`,
          }
        })
        .then(async (result) => {
          localStorage.setItem('appTheme', 'basic')
          localStorage.clear()
          await dispatch(logoutUserSuccess())
          window.location.reload()
        })
        .catch(err=>{
          NotificationManager.error("Logout Failed ! try again")
        })
    }
}

export const logoutUserSuccess = () => {
  return { type: actionTypes.LOGOUT_USER }
}

export const getDownloadPortfolios = () => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .get(`${process.env.REACT_APP_API_URL}/portfolio/?is_benchmark=False`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then((result) => {
        dispatch(getDownloadPortfoliosSuccess(result.data))
      })
      .catch((err) => {
        let error = null;
        if(err && err.response ){
           error = err ? err.response.data.message : null
        }
        dispatch(getDownloadPortfoliosFailed(error))
      })
  }
}

export const getDownloadPortfoliosSuccess = (res) => {
  return { type: actionTypes.GET_DOWNLOAD_PORTFOLIOS_SUCCESS, res }
}
export const getDownloadPortfoliosFailed = (error) => {
  return { type: actionTypes.GET_DOWNLOAD_PORTFOLIOS_FAILED, error }
}

export const generateReport = (data) => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios.post(`${process.env.REACT_APP_API_URL}/reports_new/full`, data, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  }
}

export const uploadPortfolioRequest = (data,isFund) => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    const api_url = isFund ? `${process.env.REACT_APP_API_URL}/portfolio/fund_of_funds/` : `${process.env.REACT_APP_API_URL}/portfolio/`
    return axios
      .post(api_url, data, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then((result) => {
        dispatch(uploadPortfolioSuccess(result.data))
      })
      .catch((err) => {
        const error = err.response.data.message
        dispatch(uploadPortfolioFailed(error))
        throw new Error(error)
      })
  }
}

export const uploadPortfolioSuccess = (res) => {
  return { type: actionTypes.UPLOAD_PORTFOLIO_SUCCESS, res }
}
export const uploadPortfolioFailed = (error) => {
  return { type: actionTypes.UPLOAD_PORTFOLIO_FAILED, error }
}
export const changeEmail = (data) => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .post(`${process.env.REACT_APP_API_URL}/user/change_email`, data, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then((result) => {
        dispatch(changeEmailSuccess(result.data.data))
      })
      .catch((err) => {
        const error = err.response.data.message
        throw new Error(error)
      })
  }
}

export const changeEmailSuccess = (res) => {
  return { type: actionTypes.CHANGE_EMAIL_SUCCESS, res }
}
export const verifyCode = (data) => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .post(`${process.env.REACT_APP_API_URL}/user/verify`, data, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then((result) => {
        dispatch(verifyCodeSuccess(result.data.data))
      })
      .catch((err) => {
        const error = err.response.data.message
        throw new Error(error)
      })
  }
}


export const verifyCodeSuccess = (res) => {
  return { type: actionTypes.VERIFY_CODE_SUCCESS, res }
}
export const changePassword = (data) => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .post(`${process.env.REACT_APP_API_URL}/user/change_pwd`, data, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then(async (result) => {
      })
      .catch(err=>{
        const error=err.response && err.response.data.message
        throw new Error(error)
      })

      
  }
}
export const deletePortfolioRequest = (portfolios) => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .delete(`${process.env.REACT_APP_API_URL}/portfolio/?portfolio_ids=${portfolios.join()}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then((result) => {
        return ;
      })
      .catch((err) => {
        const error = err.response.data.message
        throw new Error(error)
      })
  }
}
export const setDownloadPortfolio = (portfolio) => {
  return async (dispatch, getState) => {
    dispatch(setDownloadPortfolioSuccess(portfolio))
  }
}

export const setDownloadPortfolioSuccess = (res) => {
  return { type: actionTypes.SET_DOWNLOAD_PORTFOLIO, res }
}
export const setDownloadTags = (tags) => {
  return async (dispatch, getState) => {
    const auth = getState().auth
    const { userInfo, selectedDownloadPort } = auth
    const yearEmissions = userInfo.year.emissions

    const data = {
      year: yearEmissions,
      field: tags.join(';'),
      portfolio_id: selectedDownloadPort.value,
      version_portfolio: selectedDownloadPort.version,
    }
    await dispatch(setDownloadTagsSuccess(tags))
    await dispatch(getDownloadDetails(data))
  }
}

export const setDownloadTagsSuccess = (res) => {
  return { type: actionTypes.SET_DOWNLOAD_TAGS, res }
}
export const setEmissions = () => {
  return async (dispatch) => {
    await dispatch(setEmissionsSuccess())
  }
}

export const setEmissionsSuccess = (res) => {
  return { type: actionTypes.SET_EMISSIONS_SUCCESS, res }
}

export const getFixRate = (year,quarter) => {
  return async (dispatch, getState) => {
    const accessToken = getState().auth.currentUser.access_token

    return axios
      .get(`${process.env.REACT_APP_API_URL}/currencies/?year=${year}&quarter=${quarter.slice(1,quarter.length)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      .then((result) => {
        dispatch(getFixRateSuccess(result.data))

      })
      .catch((err) => {
        const error = err.response.data.message
        throw new Error(error)
      })
  }
}

export const getFixRateSuccess = (res) => {
  return { type: actionTypes.GET_FIX_RATE_SUCCESS, res }
}
export const getAccessToken = () => {
  return async (dispatch, getState) => {
    const refreshToken = getState().auth.currentUser.refresh_token

    return axios
      .post(`${process.env.REACT_APP_API_URL}/user/refresh`,{}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      })
      .then((result) => {
        dispatch(getAccessTokenSuccess(result.data))
        window.location.reload()
      })
      .catch((err) => {
        const errorType = err && err.response ? err.response.data.type : null
        if(errorType && errorType == 're-login'){
          NotificationManager.error("Session Expired!")
          dispatch(logoutUser())
        }
      })
  }
}

export const getAccessTokenSuccess = (res) => {
  return { type: actionTypes.GET_ACCESS_TOKEN, res }
}

export const changePasswordRequest = () => {
  return async (dispatch, getState) => {
    history.push("/update-password")
    window.location.reload()
  }
}
export const updateVerificationCode = () => {
  return async (dispatch, getState) => {
    history.push("/verification-code")
    window.location.reload()
  }
}





/* eslint-disable */
