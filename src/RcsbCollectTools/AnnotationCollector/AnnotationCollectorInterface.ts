import {CoreCollectorInterface} from "../CoreCollectorInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    AlignmentResponse,
    AnnotationFeatures,
    Feature, FilterInput,
    QueryAnnotationsArgs,
    Source
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AnnotationTrack, FeaturePositionGaps} from "./AnnotationTrack";
import {ExternalTrackBuilderInterface} from "../FeatureTools/ExternalTrackBuilderInterface";
import {PolymerEntityInstanceInterface} from "../Translators/PolymerEntityInstancesCollector";

export type IncreaseAnnotationValueType = (feature:{type:string; targetId:string; positionKey:string; d:Feature; p:FeaturePositionGaps;})=>number;
export interface AnnotationProcessingInterface {
    getAnnotationValue?:IncreaseAnnotationValueType;
    computeAnnotationValue?:(annotationTracks: Map<string, AnnotationTrack>)=>void;
    addTrackElementCallback?:IncreaseAnnotationValueType;
}

export interface CollectAnnotationsInterface extends QueryAnnotationsArgs {
    collectSwissModel?: boolean;
    rcsbContext?:Partial<PolymerEntityInstanceInterface>
    annotationProcessing?: AnnotationProcessingInterface;
    externalAnnotationTrackBuilder?: ExternalTrackBuilderInterface;
    annotationGenerator?(annotations: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>>;
    annotationFilter?(annotations: Array<AnnotationFeatures>): Promise<Array<AnnotationFeatures>>;
    titleSuffix?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
    trackTitle?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
    typeSuffix?(ann: AnnotationFeatures, d: Feature): Promise<string|undefined>;
}

export type AnnotationCollectConfig = Partial<CollectAnnotationsInterface>;

export interface AnnotationCollectorInterface extends CoreCollectorInterface {
    collect(requestConfig: CollectAnnotationsInterface): Promise<Array<RcsbFvRowConfigInterface>>;
    getAnnotationConfigData(): Promise<Array<RcsbFvRowConfigInterface>>;
    //TODO this two methods are redundant Array<Feature> can be collected from Array<AnnotationFeatures>
    getAnnotationFeatures(): Promise<Array<AnnotationFeatures>>
    getFeatures(): Promise<Array<Feature>>;
}