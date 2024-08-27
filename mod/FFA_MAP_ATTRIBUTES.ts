import { Module, ModuleInterop } from '../api/module.ts';
import { GlobalRule } from '../api/rule.ts';
import { ImproveServerStability } from '../utils/_temp.ts';

////////////////////////////////////////////////////////////////////////////////////////////////

export interface FMAConfig {
    asSubroutine: boolean;
    includeVisuals: boolean;
}
export const FMA_MODULE_IMPORTER = (config: FMAConfig): ModuleInterop => {
    if (config.asSubroutine) {
        m.new.Subroutine('Sub1')
            .title(m._interop._content.name)
            .actions(...mainActions);
    }
    //FIXME

    if (config?.includeVisuals) {
        m.patch.attachRules(ruleofVisualize._interop);
    }

    return m._interop;
};

////////////////////////////////////////////////////////////////////////////////////////////////

const m = Module({
    name: 'FFA_MAP_ATTR',
    global: {
        iterator: '', //FIXME For Global Variable() only works on pure variables so iterators cannot be part of module variables...
        mapCenter: '',
        mapSize: '',
        mapFlatness: '',
    },
    player: {},
});

// alternative references for ease of use
const g = m.var.Global();

////////////////////////////////////////////////////////////////////////////////////////////////

const mainActions = GlobalRule()
    .actions(
        `Abort If(!Array Contains(Array(Game Mode(Deathmatch), Game Mode(Bounty Hunter), Game Mode(Snowball Deathmatch)),Current Game Mode))`,
    )
    .actions(
        `${g.mapCenter()} = Vector(0, 0, 0)`,
        `${g.mapSize()} = Vector(0, 0, 0)`, // we will work it into number, at the start this is an accumulator
        `${g.mapFlatness()} = 0`,
    )
    .actions(
        `For Global Variable(${'A'}, 0, Count Of(Spawn Points(All Teams)), 1)`,
        `${g.mapCenter()} += Position Of(Spawn Points(All Teams)[${'Global.A'}])`,
        `End`,
        `${g.mapCenter()} /= Count Of(Spawn Points(All Teams))`,
    )
    .actions(
        `For Global Variable(${'A'}, 0, Count Of(Spawn Points(All Teams)), 1)`,
        `${g.mapSize()} += Vector(
        Absolute Value(
            X Component Of(Position Of(Spawn Points(All Teams)[${'Global.A'}])
            - ${g.mapCenter()})),
        Absolute Value(
            Y Component Of(Position Of(Spawn Points(All Teams)[${'Global.A'}])
            - ${g.mapCenter()})),
        Absolute Value(
		    Z Component Of(Position Of(Spawn Points(All Teams)[${'Global.A'}])
            - ${g.mapCenter()})))`,
        `End`,
        `${g.mapSize()} /= Count Of(Spawn Points(All Teams))`,
    )
    .actions(ImproveServerStability())
    .actions(
        `${g.mapFlatness()} =
        Y Component Of(
            Last Of(
                Sorted Array(
                    Spawn Points(All Teams),
                    Y Component Of(Position Of(Current Array Element))))
            - First Of(
                Sorted Array(
                    Spawn Points(All Teams),
                    Y Component Of(Position Of(Current Array Element)))))
            / 30
            + Y Component Of(${g.mapSize()})`,
        `"Maps with significant high ground available for any hero via elevator."
If(Array Contains(Array(Map(Hollywood), Map(Hollywood Halloween)), Current Map))`,
        `   ${g.mapFlatness()} += 1`,
        `End`,
    )
    .actions(
        `${g.mapSize()} =
            X Component Of(${g.mapSize()})
            + Y Component Of(${g.mapSize()})
			+ Z Component Of(${g.mapSize()})`,
        `${g.mapSize()} /= 30`,
        //FIXME  [\"0.62\"] FUCKS IT UP
        //`"Maps that are an abomination. The value derived from the Chamber map with the size of \"0.62\", where the square is \"20+20\". Expanse is \"384+384\", Green Screen is \"50+50\", so the values are obvious."
        `If(Array Contains(Array(Map(Workshop Expanse), Map(Workshop Expanse Night), Map(Workshop Green Screen)), Current Map))`,
        `   ${g.mapSize()} = Current Map == Map(Workshop Green Screen) ? 1.550 : 11.900`,
        `End`,
    )
    .actions(
        // FIXME [;] FUCKS IT UP
        //`"Name ; Center ; Size ; Flatness ; Number of spawn points"
        `Log To Inspector(
        Custom String("{0};{1};{2}",
            Current Map,
            Custom String("{0};{1};{2}",
                ${g.mapCenter()},
	            ${g.mapSize()},
                ${g.mapFlatness()}),
            Count Of(Spawn Points(All Teams))))`,
    )
    ._interop._content.actions._interop._content;

const ruleofVisualize = GlobalRule()
    .title('Visualize')
    .actions(
        'Call Subroutine(Sub1)',
    )
    .actions(ImproveServerStability())
    .actions(
        `For Global Variable(${'A'}, 0, Count Of(Spawn Points(All Teams)), 1)`,
        `Create Effect(
            All Players(All Teams), Ring, Color(Blue),
            Position Of(Spawn Points(All Teams)[${'Global.A'}]),
            1, Visible To)`,
        `Create In-World Text(
            All Players(All Teams), ${'Global.A'}, 
            Position Of(Spawn Points(All Teams)[${'Global.A'}]), 
            2, Do Not Clip, Visible To, Color(Blue), Visible Always)`,
        `End`,
    )
    .actions(ImproveServerStability())
    .actions(
        `Create Effect(
            All Players(All Teams), Sphere, Color(Green),
            ${g.mapCenter()},
            1, Visible To)`,
        `Create Icon(
            All Players(All Teams),
            ${g.mapCenter()} + Vector(0,Total Time Elapsed % 1 < 0.500 ? Total Time Elapsed % 1 : 1 - Total Time Elapsed % 1, 0),
            Arrow: Down, Visible To and Position, Color(Green), True)`,
        `Create Effect(
            All Players(All Teams), Sphere, Color(Yellow),
            Vector(0, 0, 0),
            1, Visible To)`,
        `Create Icon(
            All Players(All Teams),
            Vector(0, 0, 0),
            Arrow: Down, Visible To, Color(Yellow), True)`,
    )
    .actions(
        `Create HUD Text(
            All Players(All Teams),
            Custom String("{0} SPAWN POINTS", Icon String(Arrow: Down)),
            Null, Null, Left, 0, Color(Blue), Color(White), Color(White), Visible To, Visible Always)`,
        `Create HUD Text(
            All Players(All Teams),
            Custom String("{0} CENTER POINT", Icon String(Arrow: Down)),
            Null, Null, Left, 0, Color(Green), Color(White), Color(White), Visible To, Visible Always)`,
        `Create HUD Text(
            All Players(All Teams),
            Custom String("{0} (0,0,0) POINT", Icon String(Arrow: Down)),
            Null, Null, Left, 0, Color(Yellow), Color(White), Color(White), Visible To, Visible Always)`,
        `Create HUD Text(
            All Players(All Teams),
            Custom String("{0} COUNT OF SPAWN POINTS =  {1}", Icon String(Flag), Count Of(Spawn Points(All Teams))),
            Null, Null, Left, 1, Color(White), Color(White), Color(White), Visible To, Visible Always)`,
        `Create HUD Text(
            All Players(All Teams),
            Custom String("{0} FLATNESS =  {1}", Icon String(Flag), ${g.mapFlatness()}),
            Null, Null, Left, 1, Color(White), Color(White), Color(White), Visible To, Visible Always)`,
        `Create HUD Text(
            All Players(All Teams),
            Custom String("{0} SIZE =  {1}", Icon String(Flag), ${g.mapSize()}),
            Null, Null, Left, 1, Color(White), Color(White), Color(White), Visible To, Visible Always)`,
        `Create HUD Text(
            All Players(All Teams),
            Custom String("{0} CENTER =  {1}", Icon String(Flag), ${g.mapCenter()}),
			Null, Null, Left, 1, Color(White), Color(White), Color(White), Visible To, Visible Always)`,
        `Create HUD Text(
            All Players(All Teams),
            Custom String("{0} NAME =  {1}", Icon String(Flag), Current Map),
            Null, Null, Left, 1, Color(White), Color(White), Color(White), Visible To, Visible Always)`,
    );
