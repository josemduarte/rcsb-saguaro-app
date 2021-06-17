import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";

export class RcsbFvEntity extends RcsbFvAbstractModule implements RcsbFvModuleInterface{

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const entityId: string = buildConfig.entityId;
        const source: Array<Source> = buildConfig.additionalConfig?.filters? buildConfig.additionalConfig.sources : [Source.PdbEntity, Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: entityId,
            from: SequenceReference.PdbEntity,
            to: SequenceReference.Uniprot
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: entityId,
                reference: SequenceReference.PdbEntity,
                sources:source,
                addTargetInTitle:new Set([Source.PdbInstance]),
                filters:buildConfig.additionalConfig?.filters
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ? seqResult.sequence.concat(seqResult.alignment).concat(annResult) : seqResult.sequence.concat(seqResult.alignment).concat(annResult);
                this.display();
                if(buildConfig.resolve!=null)buildConfig.resolve();
            }).catch(error=>{
                console.error(error);
                throw error;
            });
        }).catch(error=>{
            console.error(error);
            throw error;
        });
    }

}