// Builds src/data/regions.geo.json: real Natural Earth 1:10m Israel boundary (world-atlas),
// split into touring regions by divider polygons. Coastline/borders come from the dataset.
const topo=require('world-atlas/countries-10m.json');const {feature}=require('topojson-client');const turf=require('@turf/turf');const fs=require('fs');
const fc=feature(topo,topo.objects.countries);
let israel=fc.features.find(f=>f.properties.name==='Israel');
const pal=fc.features.find(f=>f.properties.name==='Palestine');
israel=turf.difference(turf.featureCollection([israel,pal]))||israel;
const D={
 golan:[[35.635,32.70],[35.65,32.88],[35.62,33.0],[35.64,33.15],[35.70,33.30],[35.95,33.45],[35.95,32.6],[35.635,32.70]],
 hula:[[35.54,33.0],[35.54,33.4],[35.68,33.4],[35.64,33.15],[35.62,33.0],[35.54,33.0]],
 upper_galilee:[[34.9,32.86],[34.9,33.2],[35.54,33.2],[35.54,33.0],[35.62,33.0],[35.65,32.88],[35.08,32.86],[34.9,32.86]],
 lower_galilee:[[35.08,32.86],[35.65,32.88],[35.635,32.70],[35.6,32.2],[35.25,32.45],[35.08,32.55],[35.08,32.86]],
 carmel:[[34.8,32.55],[34.8,32.86],[35.08,32.86],[35.08,32.55],[34.8,32.55]],
 sharon:[[34.6,32.08],[34.6,32.55],[35.08,32.55],[35.25,32.45],[35.1,32.08],[34.6,32.08]],
 center:[[34.2,31.55],[34.2,32.08],[35.1,32.08],[35.1,31.88],[34.98,31.8],[34.98,31.55],[34.2,31.55]],
 jerusalem:[[34.98,31.55],[34.98,31.8],[35.1,31.88],[35.3,31.9],[35.3,31.55],[34.98,31.55]],
 judean_desert:[[35.15,31.55],[35.3,31.55],[35.3,31.9],[35.6,31.9],[35.6,30.95],[35.15,30.95],[35.15,31.55]],
 north_negev:[[34.2,30.95],[34.2,31.55],[35.15,31.55],[35.15,30.95],[34.2,30.95]],
 central_negev:[[34.2,30.25],[34.2,30.95],[35.15,30.95],[35.05,30.25],[34.2,30.25]],
 arava:[[35.05,30.25],[35.15,30.95],[35.6,30.95],[35.6,29.75],[34.98,29.75],[35.05,30.25]],
 eilat:[[34.2,29.3],[34.2,30.25],[35.05,30.25],[34.98,29.75],[35.6,29.75],[35.6,29.3],[34.2,29.3]],
};
const out=[];let total=0;
for(const [id,ring] of Object.entries(D)){
  const cut=turf.intersect(turf.featureCollection([israel,turf.polygon([ring])]));
  if(!cut){console.error('empty',id);continue}
  const s=turf.truncate(turf.simplify(cut,{tolerance:0.002,highQuality:true}),{precision:4});
  s.properties={id};const a=turf.area(s)/1e6;total+=a;
  const c=turf.pointOnFeature(s).geometry.coordinates;s.properties.labelLon=+c[0].toFixed(3);s.properties.labelLat=+c[1].toFixed(3);
  s.properties.bbox=turf.bbox(s).map(x=>+x.toFixed(3));
  console.log(id.padEnd(16),Math.round(a),'km2',s.properties.bbox.join(','));out.push(s);
}
console.log('total',Math.round(total),'israel',Math.round(turf.area(israel)/1e6));
const outline=turf.truncate(turf.simplify(israel,{tolerance:0.002,highQuality:true}),{precision:4});
fs.writeFileSync('src/data/regions.geo.json',JSON.stringify({type:'FeatureCollection',features:out}));
fs.writeFileSync('src/data/israel-outline.geo.json',JSON.stringify(outline));
