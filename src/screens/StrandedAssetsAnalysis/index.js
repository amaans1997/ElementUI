import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Paper, Grid, Tabs, Tab } from '@material-ui/core'
import TabPanel from './../../components/TabPanel'
import { strandedAssetTabs } from '../../util/tabs-config'
import { setTabValue } from '../../redux/actions/authActions'
import FossilFuel from './FossilFuel'
import CoalPower from './CoalPower'

function StrandedAssetsAnalysis() {
  const tabValue = useSelector((state) => state.auth.tabValue)
  const isVisible = useSelector((state) => state.auth.isVisible)
  const [value, setValue] = useState(tabValue)

  const dispatch = useDispatch()

  const handleChange = async (event, newValue) => {
    await dispatch(setTabValue(newValue))
    setValue(newValue)
  }

  return (
    <div className="tabs-section">
      <Grid container>
        <Grid item xs={3} />
        <Grid item xs={9}>
          <Paper position="static" color="default">
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="secondary"
              fullWidth="true"
              inkBarStyle={{ background: 'blue' }}
            >
              {' '}
              {strandedAssetTabs &&
                strandedAssetTabs.map((e, i) => (
                  <Tab label={e} {...e} style={{ fontSize: 11 }} />
                ))}
            </Tabs>
          </Paper>
          <TabPanel value={value} index={0}>
            <FossilFuel />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <CoalPower />
          </TabPanel>
        </Grid>
      </Grid>
    </div>
  )
}
export default StrandedAssetsAnalysis
