import {SequenceReference, Source} from "../../RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvAbstractModule} from "./RcsbFvAbstractModule";
import {RcsbFvModuleBuildInterface, RcsbFvModuleInterface} from "./RcsbFvModuleInterface";

export class RcsbFvInstance extends RcsbFvAbstractModule implements RcsbFvModuleInterface{

    public build(buildConfig: RcsbFvModuleBuildInterface): void {
        const instanceId: string = buildConfig.instanceId;
        const source: Array<Source> = [Source.PdbEntity, Source.PdbInstance, Source.Uniprot];
        this.sequenceCollector.collect({
            queryId: instanceId,
            from: SequenceReference.PdbInstance,
            to: SequenceReference.Uniprot
        }).then(seqResult=>{
            this.annotationCollector.collect({
                queryId: instanceId,
                reference: SequenceReference.PdbInstance,
                sources:source
            }).then(annResult=>{
                this.boardConfigData.length = this.sequenceCollector.getSequenceLength();
                this.boardConfigData.includeAxis = true;
                this.rowConfigData = !buildConfig.additionalConfig?.hideAlignments ? seqResult.sequence.concat(seqResult.alignment).concat(annResult) : seqResult.sequence.concat(annResult);
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