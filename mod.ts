import { FMA_MODULE_IMPORTER } from './mod/FFA_MAP_ATTRIBUTES.ts';
////////////////////////////////////////////////////////////////////////////////////////
import { USE_CUSTOM_ECMASCRIPT_API_PATCH } from './PATCH_ECMASCRIPT.ts';
void USE_CUSTOM_ECMASCRIPT_API_PATCH;
////////////////////////////////////////////////////////////////////////////////////////

const m = FMA_MODULE_IMPORTER({
	includeVisuals: true,
	asSubroutine: true,
});

m.lint().log();

console.log(`
settings
{
	modes
	{
		Deathmatch
	}
}    
        `);
m.compile({ lint: false, includeVariablesAs: 12 }).log();
