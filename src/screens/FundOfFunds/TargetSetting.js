/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, CircularProgress,Grid,MenuItem,FormControl,InputLabel,Select } from '@material-ui/core'
import PieChart from '../../components/ChartsComponents/PieChart'
import {  getFundTargetSetting } from '../../redux/actions/fundOfFundActions'
import DataTable from '../../components/Table/DataTable';
import {targetFundCells} from '../../util/TableHeadConfig'
import getRequestData from '../../util/RequestData'
import StackedColumn from '../../components/ChartsComponents/StackedColumn'


const Alignment = () => {
  const dispatch = useDispatch()

  const [chartData,setChartData] = useState([])
  const [tableData,setTableData] = useState([])
  const [categories,setCategories] = useState([])
  const [currentSector,setSector] = useState("")
  const [yAxisTitle,setYAxisTitle] = useState("")
  const [metric,setMetric] = useState("Contribution")

  const auth = useSelector((state) => state.auth)
  const {allPortfolios,currentFundsPortfolio,loading,filterItem} = auth
  const targetSetting = useSelector(state=>state.fund.targetSetting)

  useEffect(() => {
    fetchDetails()
  }, [])
  useEffect(() => {
    getChartData()
  }, [targetSetting])

 
  const handleMetricChange =(e)=>{
    const value = e.target.value

    if(value == 'Contribution'){
      const data = targetSetting.data
      let chartData=[]
      let categories = []
    
      if (data && Object.keys(data).length > 0) {
        Object.keys(data).map((id,index) => {
          let contrib = data[id]['Target_Setting_table']['Portfolio']['intensity']
  
          chartData.push({
              name:getPortfolioName(id),
              data:Object.values(contrib),
          })
  
          if(index == 0){
              categories = [...Object.keys(contrib)]
          }   
        })
      }
  
     setChartData(chartData)
     setCategories(categories)
     setSector(categories[0])
     setMetric(e.target.value)
    }
    else{
      console.log("testamaan")
      const data = targetSetting.data
      let chartData=[]
      let categories = []
    
      if (data && Object.keys(data).length > 0) {
        Object.keys(data).map((id,index) => {
          let allowance = data[id]['Target_Setting_table']['Allowance']['2020']
  
          chartData.push({
              name:getPortfolioName(id),
              data:Object.values(allowance),
          })
  
          if(index == 0){
              categories = [...Object.keys(allowance)]
          }     
        })
      }  
     setChartData(chartData)
     setCategories(categories)
     setSector(categories[0])
     setMetric(e.target.value)
    }
  }
  const getChildrenIds = ()=>{
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
    return result ; 
  }
  const fetchDetails = async () => {
    const data = getChildrenIds()
    const requestData = getRequestData('TARGET_SETTING', auth)
    requestData.portfolio_id = data
    delete requestData.benchmark_id
    delete requestData.version_benchmark

    await dispatch(getFundTargetSetting(requestData))
  }
    const getPortfolioName = id=>{
      let portName = ''
        if(allPortfolios && allPortfolios.length > 0){
            allPortfolios.map(portfolio=>{
                if(portfolio.portfolio_id == id){
                    portName = portfolio.name
                }
            })
        }
        return portName
  }
  const handleSectorChange = (e) => {
    const sectorName = e.target.value
    const data = targetSetting.data
    let tableData=[]
    if (data && Object.keys(data).length > 0) {
      Object.keys(data).map((id,index) => {
        let contrib = data[id]['Target_Setting_table']['Portfolio']['intensity']
        let allowance = data[id]['Target_Setting_table']['Allowance']['2020']
        let annualRed = data[id]['Target_Setting_table']['AnnualReduction'][0]['2020'] 

        tableData.push({
            name:getPortfolioName(id),
            contribution:contrib[sectorName],
            allowance:allowance[sectorName],
            annualRed:annualRed[sectorName]
        })       
      })
    }
   setTableData(tableData)
   setSector(sectorName)
  }
  const getChartData = () => {
    const data = targetSetting.data
    let chartData=[]
    let categories = []
    let tableData=[]
    let title= ''


    if (data && Object.keys(data).length > 0) {
      Object.keys(data).map((id,index) => {
        let contrib = data[id]['Target_Setting_table']['Portfolio']['intensity']
        let allowance = data[id]['Target_Setting_table']['Allowance']['2020']
        let annualRed = data[id]['Target_Setting_table']['AnnualReduction'][0]['2020'] 
        title = data[id]['axis_title'];
        chartData.push({
            name:getPortfolioName(id),
            data:Object.values(contrib),
        })

        if(index == 0){
            categories = [...Object.keys(contrib)]
        }
        tableData.push({
            name:getPortfolioName(id),
            contribution:contrib[categories[0]],
            allowance:allowance[categories[0]],
            annualRed:annualRed[categories[0]]
        })       
      })
    }

   setChartData(chartData)
   setCategories(categories)
   setTableData(tableData)
   setSector(categories[0])
   setYAxisTitle(title)
  }
  return (
      <React.Fragment>
      {loading ? (
        <CircularProgress />
      ) : targetSetting.error ? (
        <Box
          align="center"
          className="error-msg"
          style={{ marginTop: 20, fontSize: 16 }}
        >
          {targetSetting.error}
        </Box>
      ) : (
        <Box>
          <Grid item xs={4} style={{marginTop:20}}>
              <FormControl variant="outlined" >
                <InputLabel>Select Metric</InputLabel>
                <Select
                  label="Select Metric"
                  value={metric}
                  onChange={handleMetricChange}
                  style={{fontSize:14,width:300,marginBottom:20}}
                >
                  {['Contribution','Allowance'].map(metric => (
                      <MenuItem value={metric}>{metric}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          <StackedColumn
                chartKey="FUND_TARGET_SETTINGS"
                data={chartData}
                categories={categories}
                yAxisTitle={yAxisTitle}
              />
              <Grid container>
            <Grid item xs={4}>
              <FormControl variant="outlined" >
                <InputLabel>Select Sector</InputLabel>
                <Select
                  label="Select Sector"
                  value={currentSector}
                  onChange={handleSectorChange}
                  style={{fontSize:14,width:300,marginBottom:20}}
                >
                  {categories.length > 0 &&
                    categories.map((sector) => (
                      <MenuItem value={sector}>{sector}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
            <DataTable
              data={tableData}
              columns={targetFundCells}
              tableHeading="PORTFOLIO_INTENSITY"
            />
        </Box>
      )}
    </React.Fragment>
  )
}

export default Alignment
