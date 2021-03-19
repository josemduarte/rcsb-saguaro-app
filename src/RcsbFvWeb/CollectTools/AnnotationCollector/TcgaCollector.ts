import {AbstractCollector, CollectAnnotationsInterface, FeaturePositionGaps} from "./AbstractCollector";
import {AnnotationFeatures, Key, Source} from "../../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvDisplayTypes, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";

export class TcgaCollector extends AbstractCollector {

    protected processRcsbPdbAnnotations(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface): void{
        this.positionalNumberOfCases(
            data.filter(ann=>(ann.source === Source.NcbiGenome)),
            requestConfig
        );
    }

    private positionalNumberOfCases(data: Array<AnnotationFeatures>, requestConfig: CollectAnnotationsInterface){
        const nCasesTrack: Map<string,RcsbFvTrackDataElementInterface> = new Map<string, RcsbFvTrackDataElementInterface>();
        const annotations: Map<string, Map<string,RcsbFvTrackDataElementInterface>> = new Map<string, Map<string,RcsbFvTrackDataElementInterface>>();
        const type: string = "NUMBER_OF_CASES";
        this.maxValue.set(type, 0 );
        this.minValue.set(type, 0 );
        data.forEach(ann=>{
            ann.features.forEach(d=>{
                let anatomicSite: string|null = null;
                d.additional_properties?.forEach(p=>{
                    if(p.key === Key.AnatomicSite){
                        anatomicSite = p.value.toUpperCase();
                    }
                })
                if (anatomicSite !== null && !annotations.has(anatomicSite)) {
                    annotations.set(anatomicSite, new Map<string,RcsbFvTrackDataElementInterface>());
                }
                this.computeFeatureGaps(d.feature_positions).forEach(e => {
                    for(let i=e.beg_seq_id;i<=e.end_seq_id;i++){
                        const p: FeaturePositionGaps = {...e, beg_seq_id: i , end_seq_id: null};
                        const key:string = p.end_seq_id != null ? p.beg_seq_id.toString()+":"+p.end_seq_id.toString() : p.beg_seq_id.toString();

                        if (anatomicSite!=null && !annotations.get(anatomicSite).has(key)) {
                            const a: RcsbFvTrackDataElementInterface = this.buildRcsbFvTrackDataElement(p,d,ann.target_id,ann.source,anatomicSite,d.provenance_source);
                            this.addAuthorResIds(a,{
                                from:requestConfig.reference,
                                to:ann.source,
                                queryId:requestConfig.queryId,
                                targetId:ann.target_id
                            });
                            annotations.get(anatomicSite).set(key,a);
                        }
                        if (!nCasesTrack.has(key)) {
                            const a: RcsbFvTrackDataElementInterface = this.buildRcsbFvTrackDataElement(p,d,ann.target_id,ann.source,type ,d.provenance_source);
                            this.addAuthorResIds(a,{
                                from:requestConfig.reference,
                                to:ann.source,
                                queryId:requestConfig.queryId,
                                targetId:ann.target_id
                            });
                            nCasesTrack.set(key,a);
                        }else{
                            (nCasesTrack.get(key).value as number) += 1;
                            if(nCasesTrack.get(key).value > this.maxValue.get(type))
                                this.maxValue.set(type, nCasesTrack.get(key).value as number);
                            if(nCasesTrack.get(key).value < this.minValue.get(type))
                                this.minValue.set(type, nCasesTrack.get(key).value as number);
                        }
                    }

                });
            });
        });
        if(nCasesTrack.size > 0 ){
            this.annotationsConfigData.push(this.buildAnnotationTrack(Array.from<RcsbFvTrackDataElementInterface>(nCasesTrack.values()), type));
        }
        annotations.forEach((v,k)=>{
            this.annotationsConfigData.push(this.buildAnnotationTrack(
                Array.from<RcsbFvTrackDataElementInterface>(v.values()),
                k,
                {
                    display: RcsbFvDisplayTypes.COMPOSITE,
                    type: k,
                    color: "#ba3356",
                    title: k,
                    provenanceList: new Set<string>([])
                })
            );
        });
    }
}