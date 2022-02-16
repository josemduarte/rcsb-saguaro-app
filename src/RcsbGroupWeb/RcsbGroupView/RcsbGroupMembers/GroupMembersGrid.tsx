import * as React from "react";
import {Col, Container, Row} from "react-bootstrap";
import {MultipleEntityInstancesCollector} from "../../../RcsbCollectTools/Translators/MultipleEntityInstancesCollector";
import {TagDelimiter} from "../../../RcsbUtils/TagDelimiter";
import {GroupMemberItem, ItemFeaturesInterface} from "./GroupMemberItem";
import {ExtendedGroupReference, GroupAggregationUnifiedType} from "../../../RcsbUtils/GroupProvenanceToAggregationType";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {QueryResult} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchResultInterface";
import {SearchRequest} from "@rcsb/rcsb-api-tools/build/RcsbSearch/SearchRequest";
import {addGroupNodeToSearchQuery, searchGroupQuery} from "../../../RcsbSeacrh/QueryStore/SearchQueryTools";
import {RcsbSearchMetadata} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchMetadata";
import {ReturnType, SortDirection} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchEnums";
import {
    MultipleEntryPropertyCollector
} from "../../../RcsbCollectTools/PropertyCollector/MultipleEntryPropertyCollector";

interface GroupMembersGridInterface {
    groupAggregationType: GroupAggregationUnifiedType;
    groupId: string;
    searchQuery?: SearchQuery;
    index:number;
    nRows: number;
    nColumns: number;
}

interface GroupMembersGridState {
    itemList: Array<ItemFeaturesInterface>
}

export class GroupMembersGrid extends React.Component <GroupMembersGridInterface, GroupMembersGridState> {

    readonly state: GroupMembersGridState = {
        itemList: []
    }

    render():JSX.Element {
        if(this.state.itemList.length >0){
            return (
                    <Container fluid={"lg"}>
                        {
                            Array(this.props.nRows).fill(null).map((none,i)=>(
                                <Row>
                                    {
                                        Array(this.props.nColumns).fill(null).map((none,j)=>{
                                            const ei: ItemFeaturesInterface = this.state.itemList[i*this.props.nColumns+j];
                                            if(ei)
                                                return (
                                                    <Col>
                                                        <GroupMemberItem item={ei} groupAggregationType={this.props.groupAggregationType}/>
                                                    </Col>
                                                );
                                            else
                                                return null;
                                        })

                                    }
                                </Row>)
                            )
                        }
                    </Container>
            );
        }else
            return null;
    }

    componentDidMount() {
        if(this.state.itemList.length == 0)
            this.getMembersData();
    }

    componentDidUpdate(prevProps: GroupMembersGridInterface, prevState: GroupMembersGridState, snapshot?: any) {
        if(prevProps.index != this.props.index)
            this.getMembersData();
    }

    private async getMembersData(): Promise<void> {
        const searchResult: QueryResult = await this.searchRequest();
        const itemList: Array<ItemFeaturesInterface> = this.props.groupAggregationType === ExtendedGroupReference.MatchingDepositionGroupId ?
            (await (new MultipleEntryPropertyCollector()).collect({entry_ids:searchResult.result_set.map(m=>typeof m === "string" ? m : m.identifier)}))
            :
            (await (new MultipleEntityInstancesCollector()).collect({entity_ids:searchResult.result_set.map(m=>typeof m === "string" ? m : m.identifier)}));
        const visited: Set<string> = new Set<string>();
        this.setState({
            itemList: itemList
                .filter(
                    ei => {
                        const entityId: string = ei.entryId.toLowerCase()+TagDelimiter.entity + ei.entityId;
                        if(visited.has(entityId))
                            return false;
                        visited.add(entityId);
                        return true;
                    }
                ).sort((a,b)=>((a.entryId+TagDelimiter.entity+a.entityId)).localeCompare(b.entryId+TagDelimiter.entity+b.entityId))
        });
    }

    private async searchRequest(): Promise<QueryResult> {
        return await searchRequest(
            this.props.groupAggregationType,
            this.props.groupId,
            this.props.nRows*this.props.nColumns*this.props.index,
            this.props.nRows*this.props.nColumns,
            this.props.searchQuery
        );
    }
}

async function searchRequest(groupAggregationType: GroupAggregationUnifiedType, groupId: string, start:number, rows: number, searchQuery?: SearchQuery): Promise<QueryResult> {
    const search: SearchRequest = new SearchRequest();
    return  await search.request({
        query: searchQuery ? addGroupNodeToSearchQuery(groupAggregationType, groupId, searchQuery) : searchGroupQuery(groupAggregationType, groupId),
        request_options:{
            pager:{
                start: start,
                rows: rows
            },
            sort:[{
                sort_by:RcsbSearchMetadata.RcsbEntryContainerIdentifiers.EntryId.path,
                direction: SortDirection.Asc
            }]
        },
        return_type: groupAggregationType === ExtendedGroupReference.MatchingDepositionGroupId ? ReturnType.Entry : ReturnType.PolymerEntity
    });
}