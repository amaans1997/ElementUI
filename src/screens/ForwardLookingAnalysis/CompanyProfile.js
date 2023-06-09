/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Box,
  CircularProgress,
  Grid,
  InputLabel,
  FormControl,
  MenuItem,
  Select,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {get} from 'lodash'
import {
  getCompanies,
  getCompanyProfileData,
} from '../../redux/actions/flmActions'
import getRequestData from '../../util/RequestData'
import DataTable from '../../components/Table/DataTable'
import LineChart from '../../components/ChartsComponents/Line'
import { companyProfileCells } from '../../util/TableHeadConfig'

const useStyles = makeStyles(() => ({
  formControl: {
    width: 300,
    margin: 15,
  },
}))

const CompanyProfile = () => {
  const dispatch = useDispatch()

  const companyProfile = useSelector((state) => state.flm.companyProfile)
  const companyData = useSelector((state) => state.flm.companyData)
  const auth = useSelector((state) => state.auth)
  const { loading, filterItem,userInfo } = auth
  const { portScenario } = filterItem
  const classes = useStyles()
  const trial = get(userInfo,'trial',false)

  const [chartData, setChartData] = useState([])
  const [tableData, setTableData] = useState([])
  const [companyList, setCompanyList] = useState([])
  const [sectorList, setSectorList] = useState([])
  const [currentCompany, setCurrentCompany] = useState('')
  const [currentSector, setCurrentSector] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [chartLabel,setChartLabel] = useState('')

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (
      companyProfile &&
      companyProfile['data'] &&
      Object.keys(companyProfile['data']).length > 0
    ) {
      getData()
    }
  }, [companyProfile])

  const fetchCompanies = async () => {
    const data = getRequestData('COMPANY_PROFILE_COMPANIES', auth)
    const response = await dispatch(getCompanies(data))
    if (response && Object.keys(response).length > 0) {
      const sectors = Object.keys(response)
      const companies = response[sectors[0]]
      const currentCompany = companies[0]['company_id']

      setSectorList(sectors)
      setCompanyList(companies)
      setCurrentSector(sectors[0])
      setCurrentCompany(currentCompany)

      await fetchDetails(currentCompany)
    }
  }
  const fetchDetails = async (companyId) => {
    let data = getRequestData('COMPANY_PROFILE', auth)
    data = {
      ...data,
      isin: companyId,
    }
    await dispatch(getCompanyProfileData(data))
  }

  const getData = () => {
    const chartResponse = companyProfile['data']['CompanyProfile']['Chart']
    const tableResponse = companyProfile['data']['CompanyProfile']['Summary']

    let chartData = []
    let tableData = []
    let twoDegrees = []
    let beyondTwoDegree = []
    let referenceTech = []
    let companyValues = []
    let lowEnergyDemand = []
    let companyName = ''
    let chartlabel =companyProfile['data']['chart_label']

    let scenario = portScenario === 'LowEnergyDemand' ? 'LowEnergyDemand' : portScenario == 'SSP226' ? 'SSP2-26' : 'SSP1-26'


    if (chartResponse && chartResponse.length > 0) {
      chartResponse.map((res, index) => {
        let values = []
        Object.keys(res).map((key) => {
          values = [Date.UTC(key, '01', '01'), res[key]]
          if (res['Scenario'] === '2 Degrees') {
            twoDegrees.push(values)
          }
          if (res['Scenario'] === 'Beyond 2 Degrees') {
            beyondTwoDegree.push(values)
          }
          if (res['Scenario'] === 'Reference Technology') {
            referenceTech.push(values)
          }
          if (res['Scenario'] === scenario) {
            lowEnergyDemand.push(values)
          }
          if (index === chartResponse.length - 1) {
            companyValues.push(values)
            companyName = res['Scenario']
          }
        })
      })
      chartData = [
        {
          name: 'Two Degrees',
          data: twoDegrees,
        },
        {
          name: 'Beyond Two Degrees',
          data: beyondTwoDegree,
        },
        {
          name: 'Reference Technology',
          data: referenceTech,
        },
        {
          name: companyName,
          data: companyValues,
        },
        {
          name: portScenario,
          data: lowEnergyDemand,
        },
      ]
    }

    
    if (tableResponse && Object.keys(tableResponse).length > 0) {
      tableData = [
        {
          name: 'Name',
          summary: tableResponse['Name'],
        },
        {
          name: 'Sector',
          summary: tableResponse['SASB Sector'],
        }
      ]
      Object.keys(tableResponse).map(key=>{
        if(key !== 'Name' && key !== 'SASB Sector' && key !== 'GICS Sector'){
          tableData.push({
            name:key,
            summary:tableResponse[key]
          })
        }
       
      })
    }

    
    

    setChartData(chartData)
    setTableData(tableData)
    setCompanyName(companyName)
    setChartLabel(chartlabel)
  }
  const handleSectorChange = async (e) => {
    const sector = e.target.value
    const response = companyData['data']
    const companyList = response[sector]
    const currentCompany = companyList[0]['company_id']

    setCurrentSector(sector)
    setCompanyList(companyList)
    setCurrentCompany(currentCompany)

    await fetchDetails(currentCompany)
  }
  const handleCompanyChange = async (event) => {
    const companyId = event.target.value
    setCurrentCompany(companyId)

    await fetchDetails(companyId)
  }
  return (
    <React.Fragment>
      {loading ? (
        <CircularProgress />
      ) : companyData.error ? (
        companyData.error
      ) : companyProfile.error ? (
        <Box
          align="center"
          className="error-msg"
          style={{ marginTop: 20, fontSize: 16 }}
        >
          {companyProfile.error}
        </Box>
      ) : (
        <Box>
          <Grid container>
            <Grid item xs={4}>
              <FormControl variant="outlined" className={classes.formControl} id="demo-simple-select-filled-label">
              <InputLabel>Sector</InputLabel>
                <Select
                labelId="demo-simple-select-filled-label"
                  label="Sector"
                  value={currentSector}
                  onChange={handleSectorChange}
                  style={{ fontSize: 14 }}
                >
                  {sectorList.length > 0 &&
                    sectorList.map((sector) => (
                      <MenuItem value={sector}>{sector}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl variant="outlined" className={classes.formControl}>
                <InputLabel>Company</InputLabel>
                <Select
                  label="Company"
                  value={currentCompany}
                  onChange={handleCompanyChange}
                  style={{ fontSize: 14 }}
                >
                  {companyList.length > 0 &&
                    companyList.map((company) => (
                      <MenuItem value={company.company_id}>
                        {company.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12}>
              <LineChart
                data={chartData}
                chartKey="COMPANY_PROFILE"
                chartTitle={`${companyName} Profile`}
                isExportEnabled={!trial}
                yAxisTitle={chartLabel}
              />
            </Grid>
            <Grid item xs={12}>
              <DataTable
                data={tableData}
                columns={companyProfileCells}
                tableHeading="COMPANY_PROFILE"
                isTrial={trial}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </React.Fragment>
  )
}

export default CompanyProfile
