import {expect,test} from 'bun:test';
import {canonicalPublicGraph} from '../src/lib/public-graph-data';
import {buildKnowledgeModel} from '../src/lib/graph-model';
import pilot from '../src/data/graph-relationships.json';

test('Studio relationship registry replaces website pilot rather than duplicating it',()=>{
 const data=structuredClone(canonicalPublicGraph());data.relationshipRegistry={version:1,relationships:[{...pilot.relationships[0],id:'studio-reviewed-edge',reviewMethod:'editor-explicit-review'}]};
 const links=buildKnowledgeModel(data).links.filter((l:any)=>l.reviewedRelationshipId);
 expect(links).toHaveLength(1);expect(links[0]).toMatchObject({reviewedRelationshipId:'studio-reviewed-edge',reviewMethod:'editor-explicit-review'});
});
test('explicit empty Studio registry does not resurrect pilot relationships',()=>{
 const data=structuredClone(canonicalPublicGraph());data.relationshipRegistry={version:1,relationships:[]};expect(buildKnowledgeModel(data).links.filter((l:any)=>l.reviewedRelationshipId)).toHaveLength(0);
});
test('Studio registry retains fail-closed revision and evidence validation',()=>{
 const data=structuredClone(canonicalPublicGraph());data.relationshipRegistry={version:1,relationships:[structuredClone(pilot.relationships[0])]};data.relationshipRegistry.relationships[0].sources[0].transcriptRevisionId='old';expect(()=>buildKnowledgeModel(data)).toThrow('re-review');
});
