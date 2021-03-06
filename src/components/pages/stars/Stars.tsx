import React from 'react';
import './Stars.scss';
import {Link, RouteComponentProps} from "@reach/router";
import Star from "../../../models/Star";
import {deleteStar, getStars} from "../../../services/Stars";
import {getUniverse} from "../../../services/Universes";
import Universe from "../../../models/Universe";
import Pagination from "../../util/Pageination";

export interface UniverseProps extends RouteComponentProps<{
    universeId?: number
}> {}

class StarsPage extends React.Component<UniverseProps> {
    state = {
        stars: [] as Star[],
        universe: null as Universe|null,
        newStar: null as Star|null,
        page: 1,
        maxPages: 1
    }

    componentDidMount() {
        this.loadData();
    }

    async loadData() {
        try {
            if (this.props.universeId) {
                const universe = await getUniverse(this.props.universeId);
                this.setState({universe: universe});
            }

            await this.loadStars();

            if (this.props.location?.state && (this.props.location.state as any).newStar) {
                this.setState({
                    newStar: (this.props.location?.state as any).newStar
                });
            }

        } catch (e) {
            console.error(e);
        }
    }

    async loadStars() {
        const stars = (await getStars(
            this.props.universeId || null,
            this.state.page
        ));

        this.setState({
            stars: stars.data as Star[],
            maxPages: Math.floor(stars.headers["x-total-count"] / 10) + 1
        });
    }

    changePage(page:number) {
        this.setState({page}, this.loadStars);
    }

    async deleteStar(id: number) {
        try {
            await deleteStar(id);
            // let's refresh the data afterwards
            this.loadData();
        } catch (e) {
            console.error(e);
        }
    }

    render() {
        return (
            <div className="Stars">
                <h2>
                    {
                        this.props.universeId ?
                            `Stars of Universe ${this.state.universe?.name}` :
                            "Stars"
                    }
                </h2>

                {this.state.newStar &&
                <div className="alert alert-success" role="alert">
                    Star {this.state.newStar.name} (ID: {this.state.newStar.id}) was created successfully.
                </div>
                }

                {
                    this.props.universeId && this.state.stars.length < (this.state.universe?.maxSize || 0) ?
                        <Link className="btn btn-success btnCreate float-lg-right" to={`create`}>Create Star</Link> :
                        ""
                }

                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Universe</th>

                        {
                            this.props.universeId &&
                            <th scope="col"></th>
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.stars.map((star: Star) =>
                        <tr key={star.id} className={`starColor_${star.color}`}>
                            <td>{star.id}</td>
                            <td>{star.name}</td>
                            <td>{star.universe?.name || this.state.universe?.name}</td>
                            {
                                this.props.universeId &&
                                <td>
                                    <button
                                        className="btn btn-danger btn-outline-light float-right"
                                        onClick={this.deleteStar.bind(this, star.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            }
                        </tr>
                    )}
                    </tbody>
                </table>

                {this.state.stars && this.state.maxPages > 1 &&
                    <Pagination currentPage={this.state.page} maxPages={this.state.maxPages} callback={this.changePage.bind(this)}/>
                }

            </div>
        );
    }
}

export default StarsPage;
