import * as React from "react";
import {Bar, VictoryAxis, VictoryBar, VictoryChart, VictoryStack} from "victory";
import {ReactNode} from "react";
import {ChartViewInterface} from "./ChartViewInterface";
import {ChartTools} from "../RcsbChartTools/ChartTools";
import {DynamicTickLabelComponent} from "../RcsbChartTools/DynamicTickLabelComponent";
import {BarClickCallbackType, EventBar, BarData} from "../RcsbChartTools/EventBar";
import {ChartDataInterface} from "../RcsbChartData/ChartDataInterface";
import {BarChartData} from "../RcsbChartData/BarChartData";

export class BarChartView extends React.Component <ChartViewInterface,ChartViewInterface> {

    readonly state: ChartViewInterface = {...this.props};
    readonly dataProvider: ChartDataInterface = new BarChartData(this.props.data, this.props.subData, this.props.config);

    constructor(props: ChartViewInterface) {
        super(props);
    }

    render():ReactNode {
        const {barData,subData}: {barData: BarData[]; subData: BarData[];} = this.dataProvider.getChartData();
        const width: number = ChartTools.paddingLeft + ChartTools.constWidth + ChartTools.paddingRight;
        const height: number = ChartTools.paddingBottom + barData.length*ChartTools.xIncrement;
        return (
            <div style={{width:width, height:height}}>
                <VictoryChart
                    domainPadding={{ x: ChartTools.xDomainPadding }}
                    padding={{left:ChartTools.paddingLeft, bottom:ChartTools.paddingBottom, right:ChartTools.paddingRight}}
                    height={height}
                    width={width}
                    scale={{y:"linear", x:"linear"}}
                >
                    {CROSS_AXIS}
                    {stack(barData, subData,this.props.config.barClickCallback)}
                    <VictoryAxis  tickLabelComponent={<DynamicTickLabelComponent/>}/>
                </VictoryChart>
            </div>
        );
    }

}

const CROSS_AXIS = (<VictoryAxis
    dependentAxis={true}
    crossAxis={true}
    style={{
        grid: {
            stroke: "#999999",
            strokeDasharray: "1 3"
        }
    }}
/>);

function stack(histData:BarData[],subData:BarData[],barClick:BarClickCallbackType): JSX.Element{
    return ( <VictoryStack>
        {bar(histData, "#5e94c3", <EventBar barClick={barClick}/>)}
        {bar(subData, "#d0d0d0", <EventBar />)}
    </VictoryStack>);
}

function bar(data:BarData[],color: string, barComp?: JSX.Element): JSX.Element {
    return data.length > 0 ? (<VictoryBar
        barWidth={ChartTools.xDomainPadding}
        style={{
            data: {
                fill: color
            }
        }}
        horizontal={true}
        data={data}
        dataComponent={barComp ?? <Bar />}
    />)  : null;
}