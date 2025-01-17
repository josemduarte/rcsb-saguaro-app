import {RcsbClient} from "../../RcsbGraphQL/RcsbClient";
import {CoreEntry, CorePolymerEntityInstance, QueryEntryArgs} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Yosemite/GqlTypes";

export interface PolymerEntityInstanceInterface {
    rcsbId: string;
    entityId: string;
    entryId: string;
    asymId: string;
    authId: string;
    authResId: Array<string>;
    names: string;
    taxIds: Array<string>;
}

export class PolymerEntityInstancesCollector {

    private readonly rcsbFvQuery: RcsbClient = new RcsbClient();

    public async collect(requestConfig: QueryEntryArgs): Promise<Array<PolymerEntityInstanceInterface>> {
        try {
            const result: CoreEntry = await this.rcsbFvQuery.requestEntityInstances(requestConfig);
            return PolymerEntityInstancesCollector.getEntryInstances(result);
        }catch (error) {
            console.log(error);
            throw error;
        }
    }

    private static getEntryInstances(entry: CoreEntry ): Array<PolymerEntityInstanceInterface>{
        const out: Array<PolymerEntityInstanceInterface> = new Array<PolymerEntityInstanceInterface>();
        if(entry?.polymer_entities instanceof Array){
            entry.polymer_entities.forEach(entity=>{
                if(entity.polymer_entity_instances instanceof Array){
                    PolymerEntityInstancesCollector.parsePolymerEntityInstances(entity.polymer_entity_instances, out);
                }
            })
        }
        return out;
    }

    static parsePolymerEntityInstances(polymerEntityInstances: Array<CorePolymerEntityInstance>, out: Array<PolymerEntityInstanceInterface>){
        polymerEntityInstances.forEach(instance=>{
            const name: string = instance.polymer_entity.rcsb_polymer_entity.pdbx_description;
            const taxIds: Set<string> = new Set<string>();
            if(instance?.polymer_entity?.rcsb_entity_source_organism instanceof Array)
                instance.polymer_entity.rcsb_entity_source_organism.forEach(sO=>{
                    if(typeof sO.ncbi_scientific_name === "string" && sO.ncbi_scientific_name.length > 0)
                        taxIds.add(sO.ncbi_scientific_name);
                });
            out.push({
                rcsbId: instance.rcsb_id,
                entryId: instance.rcsb_polymer_entity_instance_container_identifiers.entry_id,
                entityId: instance.rcsb_polymer_entity_instance_container_identifiers.entity_id,
                asymId: instance.rcsb_polymer_entity_instance_container_identifiers.asym_id,
                authId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_asym_id,
                authResId: instance.rcsb_polymer_entity_instance_container_identifiers.auth_to_entity_poly_seq_mapping,
                names: name,
                taxIds:Array.from(taxIds)
            });
        });
    }

}