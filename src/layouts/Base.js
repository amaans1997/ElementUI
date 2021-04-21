import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
	Drawer,
	CssBaseline,
	List,
	Button,
	Dialog,
	DialogActions,
	DialogTitle,
	DialogContent,
	DialogContentText,
	Box,
	InputAdornment,
	OutlinedInput,
	InputLabel,
	Grid,
	Select,
	MenuItem,
	FormControl
} from '@material-ui/core';
import { NotificationManager } from 'react-notifications';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { Route, Switch, Link } from 'react-router-dom';
import { slideInRight } from 'react-animations';
import Radium, { StyleRoot } from 'radium';
import ListItemLink from '../components/ListItemLink';
import { RouteData } from './Route';
import Header from '../components/Header';
import SelectwithSearch from '../components/Autocomplete';
import FilterGroup from '../components/FilterSection';
import PortfolioFootprint from '../screens/PortfolioFootprint';
import Scope3Materiality from '../screens/Scope3Materiality';
import TemperatureMetric from '../screens/TemperatureMetric';
import PortfolioOptimization from '../screens/PortfolioOptimization';
import PortfolioCarbonRisk from '../screens/PortfolioCarbonRisk';
import ForwardLookingAnalysis from '../screens/ForwardLookingAnalysis';
import StrandedAssetsAnalysis from '../screens/StrandedAssetsAnalysis';
import UrgentemDownload from '../screens/UrgentemDownload';
import GenerateReport from '../screens/GenerateReport';
import UrgentemLanding from '../screens/UrgentemLanding';
import {
	getPortfolioList,
	getUserInfo,
	setPortfolio,
	setBenchmark,
	setTabValue,
	setModule,
	setFilterVisibility
} from '../redux/actions/authActions';
import csvFile from '../assets/Dummy-file.xlsx';

const drawerWidth = 295;

const styles = (theme) => ({
	root: {
		display: 'flex',
		width: '100%'
	},
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		boxShadow: 'none'
	},
	appBarShift: {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create([ 'width', 'margin' ], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		})
	},
	menuButton: {
		marginLeft: 11,
		marginRight: 36
	},
	menuButtonIconClosed: {
		transition: theme.transitions.create([ 'transform' ], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		transform: 'rotate(0deg)'
	},
	menuButtonIconOpen: {
		transition: theme.transitions.create([ 'transform' ], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		transform: 'rotate(180deg)'
	},
	hide: {
		display: 'none'
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap'
	},
	drawerOpen: {
		width: drawerWidth,
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen
		})
	},
	drawerClose: {
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen
		}),
		overflowX: 'hidden',
		width: theme.spacing.unit * 7 + 1,
		[theme.breakpoints.up('sm')]: {
			width: theme.spacing.unit * 9 + 1
		}
	},
	toolbar: {
		display: 'flex',
		alignItems: 'center',
		marginTop: theme.spacing.unit,
		justifyContent: 'flex-end',
		padding: '0 8px',
		...theme.mixins.toolbar
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing.unit * 3
	},
	grow: {
		flexGrow: 1
	},
	icon: {
		marginRight: 10
	},
	uploadDiv: {
		position: 'absolute',
		top: 90
	},
	uploadBtn: {
		height: 50,
		width: 300,
		marginLeft: theme.spacing(2)
	},
	samplePortfolio: {
		color: '#1890ff'
	},
	labelText: {
		padding: theme.spacing(1)
	},
	textInput: {
		width: 200,
		height: 40
	},
	slideInRight: {
		animation: 'x 5s',
		animationName: Radium.keyframes(slideInRight, 'slideInRight')
	},
	select: {
		width: 200,
		height:40
	}
});

const MiniDrawer = ({ classes, history }) => {
	const [ open, setOpen ] = useState(false);
	const [ dialog, setDialog ] = useState(false);
	const [ portfolioValue, setPortfolioValue ] = useState(1000000000);
	const [ portfolioName, setPortfolioName ] = useState('');

	const dispatch = useDispatch();

	const auth = useSelector((state) => state.auth);
	const portfolios = useSelector((state) => state.auth.portfolioList);
	const currentPortfolio = useSelector((state) => state.auth.currentPortfolio);
	const currentBenchmark = useSelector((state) => state.auth.currentBenchmark);
	const currentCurrency = useSelector((state) => state.auth.currentCurrency);
	const isVisible = useSelector((state) => state.auth.isVisible);

	let currentUser = auth && auth.currentUser ? auth.currentUser : {};

	const getUserDetails = async () => {
		const data = {
			userName: currentUser.userName
		};
		await dispatch(getUserInfo(data));
	};

	const getPortfolio = async () => {
		await dispatch(getPortfolioList(currentUser.client));
	};

	const fetchDetails = async () => {
		await getUserDetails();
		await getPortfolio();
	};
	const onPortfolioChange = (currentValue) => {
		let portfolio = {};
		if (portfolios && portfolios.length > 0) {
			portfolios.map((port) => {
				if (port.label == currentValue) {
					portfolio = { ...port };
				}
			});
		}
		dispatch(setPortfolio(portfolio));
	};
	const onBenchmarkChange = (currentValue) => {
		let benchmark = {};
		if (portfolios && portfolios.length > 0) {
			portfolios.map((port) => {
				if (port.label == currentValue) {
					benchmark = { ...port };
				}
			});
		}
		dispatch(setBenchmark(benchmark));
	};
	const setDefaultTab = async (e) => {
		await dispatch(setTabValue(0));
		await dispatch(setModule(e.name));
		window.location.reload();
	};
	const handleUploadPortfolio = () => {
		setDialog(true);
	};
	const handleCloseDialog = () => {
		setDialog(false);
	};
	const uploadPortfolio = () => {
		if (!portfolioValue) {
			NotificationManager.error('Portfolio value cannot be empty!');
			return;
		}
		if (!portfolioName) {
			NotificationManager.error('Portfolio Name cannot be empty!');
			return;
		}
	};
	const hideFilterSection = async () => {
		await dispatch(setFilterVisibility(true));
	};
	useEffect(() => {
		fetchDetails();
	}, []);
	let contentClass = classNames({
		'content-part-visible': isVisible,
		'content-part-not-visible': !isVisible
	});

	return (
		<div className={classes.root}>
			<CssBaseline />
			<Header history={history} />
			<Drawer
				variant="permanent"
				className={classNames(classes.drawer, {
					[classes.drawerOpen]: open,
					[classes.drawerClose]: !open
				})}
				classes={{
					paper: classNames({
						[classes.drawerOpen]: open,
						[classes.drawerClose]: !open
					})
				}}
				open={open}
			>
				<div className={classes.toolbar} />
				<List style={{ paddingTop: 20 }}>
					{RouteData.map((e, index) => (
						<ListItemLink primary={e.name} icon={e.icon} to={e.url} handleClick={() => setDefaultTab(e)} />
					))}
				</List>
			</Drawer>
			<main className={classes.content}>
				{isVisible ? window.location.pathname != '/' ? (
					<div className="filter-main">
						<label className="filter-heading">Filters</label>
						<div className="filter-part">
							<FilterGroup />
						</div>
					</div>
				) : (
					<div className={classes.uploadDiv}>
						<Button
							variant="outlined"
							color="primary"
							className={classes.uploadBtn}
							onClick={handleUploadPortfolio}
						>
							Upload Portfolio
						</Button>
					</div>
				) : (
					<StyleRoot>
						<span onClick={hideFilterSection} style={styles.slideInRight}>
							<ArrowForwardIosIcon style={{ position: 'absolute', left: 80, top: 300 }} />
						</span>
					</StyleRoot>
				)}
				<div className={contentClass}>
					<div>
						<div style={{ display: 'flex', width: '100%' }}>
							<div style={{ display: 'flex', width: '75%' }}>
								<SelectwithSearch
									heading={'Select Portfolio'}
									data={portfolios && portfolios.length > 0 ? portfolios : []}
									// defaultValue={currentPortfolio}
									handleChange={onPortfolioChange}
									type="portfolio"
									currentValue={currentPortfolio}
								/>
								<SelectwithSearch
									heading={'Select Benchmark'}
									data={portfolios && portfolios.length > 0 ? portfolios : []}
									// defaultValue={currentBenchmark}
									handleChange={onBenchmarkChange}
									type="benchmark"
									currentValue={currentBenchmark}
								/>
							</div>
							<Button
								variant="outlined"
								color="secondary"
								style={{ marginTop: -2, height: 45, width: '16%' }}
								onClick={() => history.push('/settings')}
							>
								1 USD = 1USD
							</Button>
						</div>
					</div>
				</div>
				<Switch>
					<Route path="/portfolio-footprint" exact>
						<PortfolioFootprint />
					</Route>
					<Route path="/scope3-materiality" exact>
						<Scope3Materiality />
					</Route>
					<Route path="/temperature-metric" exact>
						<TemperatureMetric />
					</Route>
					<Route path="/portfolio-optimization" exact>
						<PortfolioOptimization />
					</Route>
					<Route path="/portfolio-carbon-risk" exact>
						<PortfolioCarbonRisk />
					</Route>
					<Route path="/forward-looking-analysis" exact>
						<ForwardLookingAnalysis />
					</Route>
					<Route path="/stranded-assets-analysis" exact>
						<StrandedAssetsAnalysis />
					</Route>
					<Route path="/urgentem-download" exact>
						<UrgentemDownload />
					</Route>
					<Route path="/urgentem-api" exact />
					<Route path="/generate-report" exact>
						<GenerateReport />
					</Route>
					<Route path="/">
						<UrgentemLanding />
					</Route>
				</Switch>
			</main>
			<Dialog open={dialog} keepMounted onClose={handleCloseDialog}>
				<DialogTitle>Upload Portfolio</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Please download our sample portfolio for an exemplary structure of your portfolio.
						<Box>
							<a href={csvFile} download="Sample Portfolio" className={classes.samplePortfolio}>
								Sample Portfolio
							</a>
						</Box>
					</DialogContentText>
					<Grid container style={{ marginTop: 10 }}>
						<Grid item xs={3}>
							<InputLabel className={classes.labelText}>Currency :</InputLabel>
						</Grid>
						<Grid item xs={3}>
							<FormControl variant="outlined">
								<Select label="Select Currency" className={classes.select} placeholder="currency">
									<MenuItem value="USD">USD</MenuItem>
								</Select>
							</FormControl>
						</Grid>
					</Grid>
					<Grid container style={{ marginTop: 10 }}>
						<Grid item xs={3}>
							<InputLabel className={classes.labelText}>Portfolio Value :</InputLabel>
						</Grid>
						<Grid item xs={3}>
							<OutlinedInput
								type="number"
								className={classes.textInput}
								value={portfolioValue}
								onChange={(e) => setPortfolioValue(e.target.value)}
							/>{' '}
						</Grid>
					</Grid>
					<Grid container style={{ marginTop: 10 }}>
						<Grid item xs={3}>
							<InputLabel className={classes.labelText}>Portfolio Name :</InputLabel>
						</Grid>
						<Grid item xs={3}>
							<OutlinedInput
								className={classes.textInput}
								value={portfolioName}
								onChange={(e) => setPortfolioName(e.target.value)}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>Close</Button>
					<Button onClick={uploadPortfolio} color="primary">
						Upload
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default withStyles(styles, { withTheme: true })(MiniDrawer);
