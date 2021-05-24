import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import CONFIG from '../../../util/config'

function ColumnChart({ data, categories,chartKey,yAxisTitle,subtitle,isLegend }) {
  const title =CONFIG['CHART'][chartKey]['TITLE']
  let yAxis=yAxisTitle;
  let legend = isLegend == false ? isLegend : true

  console.log("legend",legend)
  console.log("isLegend",isLegend)

  if(!yAxisTitle){
    yAxis=CONFIG['CHART'][chartKey]['Y_AXIS_TITLE']
  }

  const currentTheme = localStorage.getItem('appTheme');

  const options = {
    chart: {
      type: "column",
    },
    title: {
      text: title,
      align:'left',
      x:20,
      y:25
    },
    subtitle:{
        text: subtitle ? subtitle : null,
        align:'left',
    },
    xAxis: {
        categories: categories,
        title: {
          text: '',
        },
        labels: {
          style: {
            color: currentTheme == 'dark' ? '#FFFFFF' : '#000000'
          }
        },
      },
    yAxis: {
        min: 0,
        title: {
          text:yAxis ,
          align: "high",
          style: {
            color: currentTheme == 'dark' ? '#FFFFFF' : '#000000'
          }
        },
        labels: {
          overflow: "justify",
          style: {
            color: currentTheme == 'dark' ? '#FFFFFF' : '#000000'
          }
        },
      },

    plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0
        },
        series: {
            dataLabels: {
                enabled: true,
                color: currentTheme == 'dark' ? '#FFFFFF' : '#000000',
                style: {
                    fontWeight: 'normal'
                }
            },
            borderWidth: 1,
            borderColor: currentTheme == 'dark' ? '#000000' : '#FFFFFF'
        }
      },
      legend: {
        enabled:legend,
        itemStyle:{
            color: currentTheme == 'dark' ? '#FFFFFF' : '#000000'
        }
    },
    series: data,
  };
  
  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}

export default ColumnChart;
