import {AlignmentResponse, QueryAlignmentArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import queryAlignment from "./Queries/Borrego/QueryAlignments.graphql";
import {RcsbCoreQueryInterface} from "./RcsbCoreQueryInterface";
import {GraphQLRequest} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/GraphQLRequest";

interface AlignmentResponseInterface{
    alignment: AlignmentResponse;
}

export class RcsbQueryAlignment implements RcsbCoreQueryInterface<QueryAlignmentArgs,AlignmentResponse>{
    readonly client: GraphQLRequest = new GraphQLRequest("borrego");
    public async request(requestConfig: QueryAlignmentArgs): Promise<AlignmentResponse> {
        try {
            const result: AlignmentResponseInterface = await this.client.request<QueryAlignmentArgs,AlignmentResponseInterface>({
                    queryId: requestConfig.queryId,
                    from: requestConfig.from,
                    to: requestConfig.to,
                    range: requestConfig.range
                },
                queryAlignment
            );
            return result.alignment;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}
