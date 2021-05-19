import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress, Grid, InputLabel, FormControl, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
	getCarbonCompanies,
	getCarbonReturnsLineData,
	getCarbonReturnsTableData
} from '../../redux/actions/flmActions';
import getRequestData from '../../util/RequestData';
import DataTable from '../../components/Table/DataTable';
import LineChart from '../../components/ChartsComponents/Line';

const useStyles = makeStyles(() => ({
	formControl: {
		width: 200,
		margin: 15
	}
}));

const CarbonAdjustedReturns = ({}) => {
	const dispatch = useDispatch();
	const classes = useStyles();

	const carbonReturnsTableData = useSelector((state) => state.flm.carbonReturnsTableData);
	const carbonReturnsLineData = useSelector((state) => state.flm.carbonReturnsLineData);
	const companyData = useSelector((state) => state.flm.companyData);

	const auth = useSelector((state) => state.auth);
	const { loading, filterItem } = auth;
	const { emission } = filterItem;

	const [ chartData, setChartData ] = useState([]);
	const [ returnData, setReturnData ] = useState([]);
	const [ carbonData, setCarbonData ] = useState([]);
	const [ sectorList, setSectorList ] = useState([]);
	const [ companyList, setCompanyList ] = useState([]);
	const [ currentCompany, setCurrentCompany ] = useState('');
	const [ currentSector, setCurrentSector ] = useState('');
	const [ companyName, setCompanyName ] = useState('');

	useEffect(() => {
		fetchCompanies();
	}, []);
	useEffect(
		() => {
			getCompanyList();
		},
		[ companyData ]
	);
	const fetchCompanies = async () => {
		console.log('test');
		const data = getRequestData('COMPANY_PROFILE_COMPANIES', auth);
		console.log('data>>', data);
		await dispatch(getCarbonCompanies(data));
	};
	const getCompanyList = async () => {
		const response = companyData['data'];
		if (response && Object.keys(response).length > 0) {
			const sectors = Object.keys(response);
			const companies = response[sectors[0]];
			const currentCompany = companies[0]['company_id'];

			setSectorList(sectors);
			setCompanyList(companies);
			setCurrentSector(sectors[0]);
			setCurrentCompany(currentCompany);
			setCompanyName(companies[0]['name']);

			await fetchDetails(companies[0]);
		}
	};

	useEffect(
		() => {
			if (
				carbonReturnsTableData &&
				carbonReturnsTableData['data'] &&
				Object.keys(carbonReturnsTableData['data']).length > 0 &&
				carbonReturnsLineData &&
				carbonReturnsLineData['data'] &&
				Object.keys(carbonReturnsLineData['data']).length > 0
			) {
				getChartData();
				getTableData();
			}
		},
		[ carbonReturnsTableData, carbonReturnsLineData ]
	);

	const formatDate = (currentDate) => {
		const data = currentDate.split('-');
		const year = data[0];
		const month = data[1];
		const date = data[2];
		return { year, month, date };
	};

	const fetchDetails = async (company) => {
		let data = getRequestData('CARBON_ADJUSTED_RETURNS', auth);
		data = {
			...data,
			isin: company['company_id'],
			ticket: company['ticket']
		};
		await dispatch(getCarbonReturnsLineData(data));
		await dispatch(getCarbonReturnsTableData(data));
	};
	const getTableHeader = (label) => {
		let name = '';
		let index = 0;

		switch (label) {
			case 'Annualised5Y':
				name = 'Annualized Returns 5Y';
				index = 4;
				break;
			case 'Annualised3Y':
				name = 'Annualized Returns 3Y';
				index = 3;
				break;
			case 'Return1Y':
				name = 'Returns 1Y';
				index = 0;
				break;
			case 'Return3Y':
				name = 'Returns 3Y';
				index = 1;
				break;
			case 'Return5Y':
				name = 'Returns 5Y';
				index = 2;
				break;
			default:
				break;
		}
		return { index, name };
	};
	const getTableData = () => {
		const tableResponse = carbonReturnsTableData['data'];
		let returnsData = [];
		let carbonData = [];

		let emissionVal = emission == 'Sc12' ? 'AvgInference_Scope_12' : 'AvgInference_Scope_123';

		let tableData1 = tableResponse['Table1'];
		let tableData2 = tableResponse['Table2'];

		Object.keys(tableData1['company']).map((data1) => {
			if (data1 != 'Annualised1Y') {
				const { index, name } = getTableHeader(data1);
				returnsData[index] = {
					name: name,
					sector: tableData1['company'][data1],
					portfolio: tableData1['sector'][data1],
					company: tableData1['portfolio'][data1]
				};
			}
		});
		Object.keys(tableData2['company'][emissionVal]).map((data1) => {
			if (data1 != 'Annualised1Y') {
				const { index, name } = getTableHeader(data1);
				carbonData[index] = {
					name: name,
					sector: tableData2['company'][emissionVal][data1],
					portfolio: tableData2['sector'][emissionVal][data1],
					company: tableData2['portfolio'][emissionVal][data1]
				};
			}
		});
		setReturnData(returnsData);
		setCarbonData(carbonData);
	};

	const getChartData = () => {
		const chartResponse = carbonReturnsLineData['data'];
		let companyValues = [];
		let portfolioValues = [];
		let sectorValues = [];
        let chartData=[]

		if (chartResponse['company'] && Object.keys(chartResponse['company']).length > 0) {
			Object.keys(chartResponse['company']).map((currentDate) => {
				const { year, month, date } = formatDate(currentDate);
				companyValues.push([ Date.UTC(year, month, date), chartResponse['company'][currentDate] ]);
			});
		}
		if (chartResponse['portfolio'] && Object.keys(chartResponse['portfolio']).length > 0) {
			Object.keys(chartResponse['portfolio']).map((currentDate) => {
				const { year, month, date } = formatDate(currentDate);
				portfolioValues.push([ Date.UTC(year, month, date), chartResponse['portfolio'][currentDate] ]);
			});
		}
		if (chartResponse['sector'] && Object.keys(chartResponse['sector']).length > 0) {
			Object.keys(chartResponse['sector']).map((currentDate) => {
				const { year, month, date } = formatDate(currentDate);
				sectorValues.push([ Date.UTC(year, month, date), chartResponse['sector'][currentDate] ]);
			});
		}
		chartData = [
			{
				name: companyName,
				data: companyValues
			},
			{
				name: 'portfolio',
				data: portfolioValues
			},
			{
				name: 'sector',
				data: sectorValues
			}
		];
		setChartData(chartData);
	};
	const handleSectorChange = async (e) => {
		const sector = e.target.value;
		const response = companyData['data'];
		const companyList = response[sector];
		const currentCompany = companyList[0]['company_id'];

		setCurrentSector(sector);
		setCompanyList(companyList);
		setCurrentCompany(currentCompany);
		setCompanyName(companyList[0]['name']);

		await fetchDetails(currentCompany);
	};
	const handleCompanyChange = async (event) => {
		const companyId = event.target.value;
		setCurrentCompany(companyId);

		await fetchDetails(companyId);
	};
	const cells = [
		{
			name: '',
			selector: 'name',
			sortable: true,
			right: false,
			wrap: true,
			style: {
				height: 50,
				fontSize: 13
			}
		},
		{
			name: companyName,
			selector: 'company',
			sortable: true,
			right: true
		},
		{
			name: 'Market',
			selector: 'sector',
			sortable: true,
			right: true
		},
		{
			name: 'Difference',
			selector: 'portfolio',
			sortable: true,
			right: true
		}
	];

	return (
		<React.Fragment>
			{loading ? (
				<CircularProgress />
			) : companyData.error ? (
				<Box align="center" className="error-msg" style={{ marginTop: 20, fontSize: 16 }}>
					{companyData.error}
				</Box>
			) : carbonReturnsTableData.error ? (
				<Box align="center" className="error-msg" style={{ marginTop: 20, fontSize: 16 }}>
					{carbonReturnsTableData.error}
				</Box>
			) : (
				<Box>
					<Grid container>
						<Grid item xs={4}>
							<FormControl variant="outlined" className={classes.formControl}>
								<InputLabel>Select Sector</InputLabel>
								<Select label="Select Sector" value={currentSector} onChange={handleSectorChange}>
									{sectorList.length > 0 &&
										sectorList.map((sector) => <MenuItem value={sector}>{sector}</MenuItem>)}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={4}>
							<FormControl variant="outlined" className={classes.formControl}>
								<InputLabel>Select Company</InputLabel>
								<Select label="Select Sector" value={currentCompany} onChange={handleCompanyChange}>
									{companyList.length > 0 &&
										companyList.map((company) => (
											<MenuItem value={company.company_id}>{company.name}</MenuItem>
										))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
					<Grid container>
						<Grid item xs={6}>
							<LineChart data={chartData} chartKey="CARBON_ADJUSTED_RETURNS" />
						</Grid>
						<Grid item xs={6}>
							<DataTable
								data={returnData}
								columns={cells}
								tableHeading="CARBON_ADJUSTED_RETURNS_TABLE1"
							/>
							<DataTable
								data={carbonData}
								columns={cells}
								tableHeading="CARBON_ADJUSTED_RETURNS_TABLE2"
							/>
						</Grid>
					</Grid>
				</Box>
			)}
		</React.Fragment>
	);
};

export default CarbonAdjustedReturns;