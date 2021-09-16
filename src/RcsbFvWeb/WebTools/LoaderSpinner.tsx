import * as React from "react";
import Loader from "react-loader-spinner";
import * as classes from "./scss/load-spinner.scss";

export class LoaderSpinner extends React.Component <{}, {}> {

    render(): JSX.Element{
        return(<div className={classes.loadSpinnerComponentScope}>
            <Loader
                type="Bars"
                color="#5e94c3"
                height={100}
                width={100}
                timeout={3000} //3 secs
            />
        </div>);
    }

}