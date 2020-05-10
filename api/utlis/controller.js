const { sanitizeEntity } = require('strapi-utils');
const {  removeExtraOrganization } = require('./removeattributes')
module.exports = {
    getActive: async(ctx, apiName, removeAttribute, EntitySelector) => {
        let sort = 0;
        if(ctx.query.sort){
            if(ctx.query.sort === 'ASC'){
                sort = -1;
            } else if(ctx.query.sort === 'DESC'){
                sort = 1;
            }
            ctx.query.sort = undefined
        }
        let entities;
        if (ctx.query._q) {
          entities = await strapi.services[apiName].search(ctx.query);
        } else {
          entities = await strapi.services[apiName].find(ctx.query);
        }

        if( sort ) {
            entities.sort( (a,b) => (b['displayDetails']['priority']-a['displayDetails']['priority'])*sort)
        }
        
        const result = entities.reduce( (result, entity) => {

            if (entity['displayDetails']['publish'] == true){
                let flag = true;

                if(EntitySelector){
                    flag = EntitySelector['invertor'] && true;
                    flag = EntitySelector['options'].indexOf(entity[EntitySelector['attr']]) == -1 ? flag : !flag
                }

                if(flag){
                    removeAttribute.forEach( func => func(entity));
                    result.push(sanitizeEntity(entity, { model : strapi.models[apiName] }))
                }
            }
            return result;
        },[]);
        
        return result;
    }
}