/*

1. Renewable supply
2. Traditional electricity demand
3. Space Heating
4. Water Heating **
5. EV's
6. Heatstore
7. Lithium ion store
8. Pumped storage
-----
9. Hydrogen production, storage & fuelcell's
10. Synthetic fuel production: liquid and gas & stores
11. Industrial demand
12. Aviation demand
    Train demand
13. Gas turbines for backup

- electric trains
- hydrogen vehicles
- biofuel vehicles
- biofuel aircraft

*/


function fullhousehold_init()
{
    unitsmode = "kwhd"
    // ---------------------------------------------------------------------------
    // dataset index:
    // 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
    onshorewind_capacity = 1.92
    offshorewind_capacity = 0.0
    solarpv_capacity = 1.92
    hydro_capacity = 0.0
    wave_capacity = 0.0
    tidal_capacity = 0.0
    nuclear_capacity = 0.0
    grid_loss_prc = 0.05
    
    // Lights, Appliances and Cooking
    number_of_lights = 10.0
    lights_power = 11.0
    alwayson = 7.0
    fridgefreezer = 262.0
    washingmachine = 136.0
    cooking = 401.0
    computing = 212.0
    
    //                 0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
    cooking_profile = [0,0,0,0,0,1,3,6,7,5,2,3,5,6,2,1,2,3,5,7,6,4,2,1];
    // Normalise
    var cooking_profile_sum = 0
    for (var z in cooking_profile) cooking_profile_sum += cooking_profile[z]
    for (var z in cooking_profile) cooking_profile[z] = cooking_profile[z] / cooking_profile_sum
    
    // Domestic Hot Water Demand
    number_showers_per_day = 1.5
    number_baths_per_day = 0.8
    number_kitchen_sink = 2.0
    number_bathroom_sink = 1.0
    
    shower_kwh = 1.125 // 7.5 mins at 9kW
    bath_kwh = 1.35   // uses 20% more water than shower at same temperature
    sink_kwh = 0.3   // 6.3L × 40K × 4200 (assuming 50C water, 70% of typical bowl)
        
    // Similar too: https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/48188/3147-measure-domestic-hot-water-consump.pdf
    DHW_profile = [2,1,1,1,1,1,3,7,23,24,23,14,13,4,2,3,4,2,3,4,4,6,7,6];
    // Normalise
    var DHW_profile_sum = 0
    for (var z in DHW_profile) DHW_profile_sum += DHW_profile[z]
    for (var z in DHW_profile) DHW_profile[z] = DHW_profile[z] / DHW_profile_sum

    // ---------------------------------------------------------------------------
    // Space heating variables
    total_floor_area = 85 // m2
    storey_height = 2.2
    wall_ins_thickness = 0.2
    floor_ins_thickness = 0.2
    loft_ins_thickness = 0.3
    window_type = "double"
    glazing_extent = 0.2
    air_change_per_hour = 1.0
   
    target_internal_temperature = 18.0
    night_time_setback = 16.0
    heatpump_COP = 3.0

    heatstore_capacity = 10.0
    heatstore = heatstore_capacity * 0.5
    
    gasboiler_efficiency = 0.92
    biomassboiler_efficiency = 0.92
    synthfuelboiler_efficiency = 0.92
    
    prc_heat_from_direct_electric = 0.0
    prc_heat_from_heatpumps = 1.0
    prc_heat_from_gas = 0.0
    prc_heat_from_solid = 0.0
    prc_heat_from_liquid = 0.0

    // ---------------------------------------------------------------------------
    // EV performance and battery capacity
    // miles per kwh includes charge/discharge efficiency of battery (to simplify model)
    EV_miles_per_kwh = 4.0
    EV_battery_capacity = 24.0
    EV_SOC_start = EV_battery_capacity * 0.5

    EV_annual_miles = 6100
    H2EV_annual_miles = 0
    IC_annual_miles = 0
    
    H2EV_miles_per_kwh = 1.1
    IC_MPG = 60
    // Electric vehicle use profile ( miles )
    //                                    1 1 1                   1 1
    //                0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
    EV_use_profile = [0,0,0,0,0,0,0,2,7,3,0,0,1,1,0,0,0,7,2,2,2,0,0,0]

    // Calculate total miles per day travelled
    EV_miles_day = 0; for (h in EV_use_profile) EV_miles_day += EV_use_profile[h]
    // Normalise
    for (h in EV_use_profile) EV_use_profile[h] = (EV_use_profile[h] / EV_miles_day)
    
    charge_type = "smartcharge"

    // ---------------------------------------------------------------------------
    liion_capacity = 7
    liion_SOC_start = liion_capacity * 0.5
    // ---------------------------------------------------------------------------
    electrolysis_capacity = 1.35
    fuel_cell_capacity = 0.0
    
    H2_store_capacity = 10.0
    H2_store_start = H2_store_capacity * 0.5
    
    FT_fraction = 1.0
    liquid_store_capacity = 300.0
    liquid_store_start = liquid_store_capacity * 0.5
    supply_unmet_liquid_from_direct_biomass = 0
    
    sabatier_fraction = 1.0
    methane_store_capacity = 5000.0
    methane_store_start = methane_store_capacity * 0.5
    supply_unmet_gas_from_direct_biomass = 0
    
    CCGT_capacity = 1.6
    
    // Aviation
    aviation_miles_per_kwh = 1.3  // passenger miles per kwh based on 50 kWh per 100p/km
    aviation_miles = 1200
    
    train_miles = 1200
    train_miles_per_kwh = 12.5
    
    ebike_annual_miles = 2000
    ebike_miles_per_kwh = 66
    
    // Industry
    industry_enable = 0
    
    industry_electric_twh = 171 // TWh
    industry_gas_twh = 61       // TWh
    industry_liquid_twh = 12    // TWh
    industry_solid_twh = 26     // TWh
    industry_hydrogen_twh = 0   // TWh
    
    // number of buildings
    number_of_buildings = 32*1000000
    number_of_households = 26*1000000
}

function fullhousehold_run()
{
    // Electricity Supply
    total_offshore_wind_supply = 0
    total_onshore_wind_supply = 0
    total_solar_supply = 0
    total_wave_supply = 0
    total_tidal_supply = 0
    total_hydro_supply = 0
    total_nuclear_supply = 0
    
    total_elec_supply = 0
    total_elec_demand = 0
    total_grid_losses = 0
    
    // Lights appliances and cooking
    total_LAC_elec_demand = 0
    total_lighting_demand = 0

    // DHW Demand
    DHW_daily_demand = 0
    DHW_daily_demand += (shower_kwh * number_showers_per_day)
    DHW_daily_demand += (bath_kwh * number_baths_per_day)
    DHW_daily_demand += (sink_kwh * number_kitchen_sink)
    DHW_daily_demand += (sink_kwh * number_bathroom_sink)
    
    total_DHW_heat_demand = 0
    total_DHW_heatpump_elec_demand = 0
    
    // Space heating
    average_temperature = 0
    total_space_heating_demand_before_gains = 0
    total_final_space_heating_demand = 0
    total_metabolic_gains = 0
    total_metabolic_gains_unused = 0
    total_internal_gains = 0
    total_internal_gains_unused = 0
    total_solar_gains = 0
    total_solar_gains_unused = 0
    
    // Heating systems
    total_heating_demand = 0
    total_heatpump_heat_demand = 0
    total_heatpump_elec_demand = 0
    total_heatstore_charge = 0
    
    total_gasboiler_heat_demand = 0
    total_gasboiler_gas_demand = 0
    total_synthfuelboiler_heat_demand = 0
    total_synthfuelboiler_fuel_demand = 0
    total_biomassboiler_heat_demand = 0
    total_biomassboiler_biomass_demand = 0
    
    // Vehicles
    total_EV_demand = 0
    EV_SOC = EV_SOC_start
    
    total_ebike_demand = 0
    
    total_H2EV_hydrogen_demand = 0
    total_H2EV_elec_demand = 0
    total_H2V_draw_from_store = 0
    
    total_IC_liquid_demand = 0
    
    // Lithium Ion ------------------------------------------
    total_liion_charge = 0
    total_liion_discharge = 0
    liion_SOC = liion_SOC_start
    total_liion_losses = 0
    
    // Electrolysis -----------------------------------------
    total_electrolysis_demand = 0
    total_electrolysis_losses = 0
    total_fuel_cell_output = 0
    total_unmet_H2_demand = 0
    
    // Liquid
    total_synthfuel_production = 0
    total_FT_losses = 0
    total_H2_for_FT = 0
    total_biomass_for_FT = 0
    total_liquid_demand = 0
    
    // Methane
    total_methane_production = 0
    total_sabatier_losses = 0
    unmet_methane_demand = 0
    total_methane_demand = 0
    total_H2_for_sabatier = 0
    total_biomass_for_sabatier = 0
    

    
    // CCGT Backup
    total_CCGT_output = 0
    total_unmet_before_CCGT = 0
    total_CCGT_losses = 0
    max_CCGT_output = 0
    CCGT_output_filter = 0
    CCGT_output = 0
    
    // Stores
    H2_store_level = H2_store_start * 1
    liquid_store_level = liquid_store_start * 1
    methane_store_level = methane_store_start * 1
    
    // Unmet
    exess_generation = 0
    unmet_elec_demand = 0
    unmet_demand_atuse = 0
    hours_met = 0
    
    unmet_aviation_demand = 0
    unmet_liquid_demand = 0
    total_aviation_demand = 0
    
    total_train_demand = 0
    
    // Industry
    twh = 1000000000 // twh to kwh
    nhouseholds = 26000000
    
    industry_electric = (industry_electric_twh * twh) / nhouseholds
    industry_gas = (industry_gas_twh * twh) / nhouseholds
    industry_liquid = (industry_liquid_twh * twh) / nhouseholds
    industry_solid = (industry_solid_twh * twh) / nhouseholds
    industry_hydrogen = (industry_hydrogen_twh * twh) / nhouseholds

    total_industry_electric = 0
    total_industry_gas = 0
    total_industry_liquid = 0
    total_industry_solid = 0
    total_industry_hydrogen = 0
    
    unmet_array = [];
    for (var i=0; i<24; i++) unmet_array[i] = 0;
    unmet_sum = 0
    
    data = {
        supply:[],
        LAC:[],
        HP:[],
        HPS:[],
        ECAR:[],
        EH2:[],
        liion_store_level: [],
        H2_store_level:[],
        liquid_store_level:[],
        methane_store_level:[],
        CCGT_output:[],
        CCGT_output_peaker:[],
        unmet_before_CCGT:[],
        liion_discharge:[]
    }
    // ---------------------------------------------------------------------------------------------  
    // Building energy model
    // ---------------------------------------------------------------------------------------------
    // 3. Solar gains calculator from window areas and orientations
    // 4. Seperate out cooking, lighting and appliances and water heating demand.
    
    floor_area = total_floor_area / 2.0 
    side = Math.sqrt(floor_area)
         
    walls_uvalue = 1/((1/1.5)+(1/(0.03/wall_ins_thickness))) // Base U-value is uninsulated cavity wall
    floor_uvalue = 1/((1/0.7)+(1/(0.04/floor_ins_thickness))) // Base U-value is uninsulated solid floor
    loft_uvalue = 1/((1/2.0)+(1/(0.03/loft_ins_thickness))) // Base U-value is uninsulated loft
    
    if (window_type=="single") window_uvalue = 4.8
    if (window_type=="double") window_uvalue = 1.9
    if (window_type=="triple") window_uvalue = 1.3

    total_wall_area = (side * storey_height * 2) * 4
    total_window_area = total_wall_area * glazing_extent
    
    windows_south = total_window_area * 0.4
    windows_west = total_window_area * 0.2
    windows_east = total_window_area * 0.2
    windows_north = total_window_area * 0.2
    
    solar_gains_capacity = total_window_area / 3.0

    floor_WK = floor_uvalue * floor_area
    loft_WK = loft_uvalue * floor_area
    
    wall_south_WK = walls_uvalue * ((side * storey_height * 2) - windows_south)
    wall_west_WK = walls_uvalue * ((side * storey_height * 2) - windows_west)
    wall_east_WK = walls_uvalue * ((side * storey_height * 2) - windows_east)
    wall_north_WK = walls_uvalue * ((side * storey_height * 2) - windows_north)
    
    window_WK = (windows_south + windows_west + windows_east + windows_north) * window_uvalue
    
    fabric_WK = floor_WK + loft_WK + wall_south_WK + wall_west_WK + wall_east_WK + wall_north_WK + window_WK
    
    building_volume = floor_area * storey_height * 2.0
    infiltration_WK = 0.33 * air_change_per_hour * building_volume
    
    total_WK = fabric_WK + infiltration_WK
    fabric_efficiency = total_WK * 0.001
    // ---------------------------------------------------------------------------------------------    
    // ---------------------------------------------------------------------------------------------
    
    total_trad_demand = 0
    var capacityfactors_all = [];
    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
        for (var i=0; i<capacityfactors.length; i++) {
            capacityfactors[i] = parseFloat(capacityfactors[i]);
        }
        capacityfactors_all.push(capacityfactors)
        total_trad_demand += parseFloat(capacityfactors[5])
    }

    for (var hour = 0; hour < hours-1; hour++) {
        var capacityfactors = capacityfactors_all[hour];
        
        var day = parseInt(Math.floor(hour / 24))
        var temperature = parseFloat(temperaturelines[day].split(",")[1]);
        
        // ---------------------------------------------------------------------------
        // Renewable supply
        // --------------------------------------------------------------------------- 
        // 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity   
        onshorewind = capacityfactors[0] * onshorewind_capacity
        offshorewind = capacityfactors[1] * offshorewind_capacity
        wave = capacityfactors[2] * wave_capacity
        tidal = capacityfactors[3] * tidal_capacity
        solarpv = capacityfactors[4] * solarpv_capacity
        hydro = 0.4 * hydro_capacity // Assuming 40% capacity factor
        nuclear = 0.9 * nuclear_capacity // Assuming 90% uptime
        supply = onshorewind + offshorewind + solarpv + wave + tidal + hydro + nuclear
        total_elec_supply += supply

        total_offshore_wind_supply += offshorewind
        total_onshore_wind_supply += onshorewind
        total_solar_supply += solarpv
        total_wave_supply += wave
        total_tidal_supply += tidal
        total_hydro_supply += hydro
        total_nuclear_supply += nuclear
        
        // Grid losses
        supply_after_grid_loss = supply * (1.0-grid_loss_prc)
        total_grid_losses += supply * grid_loss_prc
        
        balance = supply_after_grid_loss
        demand = 0
        
        // ---------------------------------------------------------------------------
        // Industrial electric demand
        // ---------------------------------------------------------------------------
        if (industry_enable) {
            hourly_industry_electric = industry_electric / (365*24)
            demand += hourly_industry_electric
            balance -= hourly_industry_electric
            total_industry_electric += hourly_industry_electric
        }
        // ---------------------------------------------------------------------------
        // Traditional electricity demand
        // ---------------------------------------------------------------------------
        // trad_demand_factor = capacityfactors[5] / total_trad_demand
        // LAC_demand = trad_demand_factor * traditional_electric * 10
        LAC_demand = 0

        // Lighting model
        lighting_demand = number_of_lights * lights_power * 0.001
        lighting_demand -= lighting_demand * parseFloat(capacityfactors[4]) * 1.5
        if (lighting_demand<0) lighting_demand = 0
        if ((hour%24)>23) lighting_demand *= 0.1
        if ((hour%24)<7) lighting_demand *= 0.1
        LAC_demand += lighting_demand
        total_lighting_demand += lighting_demand
        
        // Fridge + freezer                 0.72 kWh/d
        LAC_demand += fridgefreezer / 8760.0
        // Washing machine                  0.34 kWh/d
        LAC_demand += washingmachine / 8760.0          
        // internet router 7W continuous    0.17 kWh/d
        LAC_demand += alwayson * 0.001
        // Cooking                          1.1 kWh/d
        LAC_demand += (cooking/365.0) * cooking_profile[hour%24]
        // Laptop                           0.58 kWh/d
        LAC_demand += computing / 8760.0
        
        balance -= LAC_demand
        demand += LAC_demand
        total_LAC_elec_demand += LAC_demand
        
        // ---------------------------------------------------------------------------
        // Hot water demand
        // ---------------------------------------------------------------------------
        heat_demand = 0

        DHW_demand = DHW_profile[hour%24] * DHW_daily_demand
        total_DHW_heat_demand += DHW_demand
        heat_demand += DHW_demand

        // ---------------------------------------------------------------------------
        // Space Heating
        // ---------------------------------------------------------------------------
        // External temperature        
        average_temperature += temperature
        
        // 1) Total heat demand 
        // night time set back 1am to 6am
        if (hour%24>=1 && hour%24<6) {
            deltaT = night_time_setback - temperature
        } else {
            deltaT = target_internal_temperature - temperature
        }
        space_heating_demand = fabric_efficiency * deltaT
        
        if (space_heating_demand<0) space_heating_demand = 0
        total_space_heating_demand_before_gains += space_heating_demand
        
        //                av person x occupancy x presence x kwh
        metabolic_gains = 80 * 2.41 * 0.2 * 0.001
        total_metabolic_gains += metabolic_gains
        
        if ((space_heating_demand-metabolic_gains)>=0) {
            space_heating_demand -= metabolic_gains
        } else {
            total_metabolic_gains_unused += (metabolic_gains - space_heating_demand)
            space_heating_demand = 0
        }
        
        internal_gains = (LAC_demand * 0.7) + (DHW_demand * 0.3) // 80% utilisation factor
        total_internal_gains += internal_gains
        // 2) Subtract estimate for other internal gains
        if ((space_heating_demand-LAC_demand)>=0) {
            space_heating_demand -= LAC_demand
        } else {
            total_internal_gains_unused += (LAC_demand - space_heating_demand)
            space_heating_demand = 0
        }
            
        // 3) Calc solar gains and subtract from heat demand
        solar_gains = parseFloat(capacityfactors[4]) * solar_gains_capacity
        total_solar_gains += solar_gains
        
        if ((space_heating_demand-solar_gains)>=0) {
            space_heating_demand -= solar_gains
        } else {
            total_solar_gains_unused += (solar_gains - space_heating_demand)
            space_heating_demand = 0
        }
        total_final_space_heating_demand += space_heating_demand
        
        // ---------------------------------------------------------------------------
        // HEATING SYSTEMS
        // ---------------------------------------------------------------------------
        heat_demand = (space_heating_demand +  DHW_demand)
        total_heating_demand += heat_demand
        
        // Heat from heatpumps
        heatpump_heat_demand = prc_heat_from_heatpumps * heat_demand
        
        // Pull heat from heatstore if available
        if ((heatstore-heatpump_heat_demand)>=0) {
            heatstore -= heatpump_heat_demand
            heatpump_heat_demand_after_heatstore = 0
        } else {
            heatpump_heat_demand_after_heatstore = heatpump_heat_demand - heatstore
            heatstore = 0
        }
        
        heatpump_elec_demand = heatpump_heat_demand_after_heatstore / heatpump_COP
        balance -= heatpump_elec_demand
        demand += heatpump_elec_demand
        total_heatpump_elec_demand += heatpump_elec_demand
        total_heatpump_heat_demand += heatpump_heat_demand_after_heatstore
                
        // Heat from gas
        gas_heat_demand = prc_heat_from_gas * heat_demand
        methane_for_heat = gas_heat_demand / gasboiler_efficiency
        total_gasboiler_heat_demand += gas_heat_demand
        total_gasboiler_gas_demand += methane_for_heat

        // Heat from gas
        synthfuel_heat_demand = prc_heat_from_liquid * heat_demand
        synthfuel_for_heat = synthfuel_heat_demand / synthfuelboiler_efficiency
        total_synthfuelboiler_heat_demand += synthfuel_heat_demand
        total_synthfuelboiler_fuel_demand += synthfuel_for_heat
                        
        // Heat from solid
        solid_heat_demand = prc_heat_from_solid * heat_demand
        biomass_for_heat = solid_heat_demand / biomassboiler_efficiency
        total_biomassboiler_heat_demand += solid_heat_demand
        total_biomassboiler_biomass_demand += biomass_for_heat
        // ---------------------------------------------------------------------------
        // TRANSPORT
        // ---------------------------------------------------------------------------        
        ebike_annual_demand = ebike_annual_miles / ebike_miles_per_kwh
        ebike_hourly_demand = ebike_annual_demand / 3650
        balance -= ebike_hourly_demand
        demand += ebike_hourly_demand
        total_ebike_demand += ebike_hourly_demand

        // ---------------------------------------------------------------------------
        // Train demand distributed eavenly across the year
        // ---------------------------------------------------------------------------
        hourly_train_demand = (train_miles / train_miles_per_kwh) / (365.0 * 24.0)
        balance -= hourly_train_demand
        demand += hourly_train_demand
        total_train_demand += hourly_train_demand
        
        // ---------------------------------------------------------------------------
        // Electric vehicles
        // ---------------------------------------------------------------------------
        EV_charge_rate = 0
        
        // EV Discharge
        unmet_discharge = 0
        miles = EV_use_profile[hour%24] * (EV_annual_miles/365.0)
        EV_discharge = miles / EV_miles_per_kwh
        if ((EV_SOC-EV_discharge)<0){
            EV_discharge = EV_SOC
            unmet_discharge = (miles / EV_miles_per_kwh) - EV_discharge
            unmet_demand_atuse += unmet_discharge
        }
        EV_SOC -= EV_discharge
        
        miles = EV_discharge * EV_miles_per_kwh

        if (charge_type=="smartcharge")
        {
            // Smart charge based on forecast of available supply over the next 24 hours
            // if the available supply is more than the demand then the charge rate can 
            // be reduced. If there was twice as much supply forecast than demand then the
            // rate of charge could by dropped to half the available supply in order to 
            // distribute the charge better across the 24h.
            EV_kWhd = EV_miles_day / EV_miles_per_kwh
            
            forecast = 0 
            forecast += supply
            forward = 24
            
            for (var h=1; h<forward; h++) {
                if ((hour+h)<hours-1) {
                    onshorewind_forecast = capacityfactors_all[hour+h][0] * onshorewind_capacity
                    offshorewind_forecast = capacityfactors_all[hour+h][1] * offshorewind_capacity
                    solarpv_forecast = capacityfactors_all[hour+h][4] * solarpv_capacity
                    supply_forecast = onshorewind_forecast + offshorewind_forecast + solarpv_forecast
                    forecast += supply_forecast
                }
            }
            demand_forecast = ((EV_battery_capacity*0.65)-EV_SOC)+(EV_kWhd*(forward/24))
            EV_charge_rate_reducer = demand_forecast / forecast
            if (EV_charge_rate_reducer>1.0) EV_charge_rate_reducer = 1.0
            
            EV_SOC_prc = EV_SOC / EV_battery_capacity
            
            EV_charge_rate = 0
            if (balance>0) {
                if ((EV_SOC+balance)>(EV_battery_capacity*0.8)) {
                    EV_charge_rate = (EV_battery_capacity*0.8) - EV_SOC
                } else {
                    EV_charge_rate = balance
                }
                //if (EV_SOC_prc>0.3)
                //    EV_charge_rate_reducer = 1.0 - (EV_SOC_prc*0.8)
                EV_charge_rate *= EV_charge_rate_reducer
            }
            //EV_charge_rate = 0
            
            EV_charge_rate_suppliment = 0
            if ((EV_SOC<(0.2*EV_battery_capacity)) && EV_charge_rate<0.3) {
                EV_charge_rate_suppliment = 0.3 - EV_charge_rate
            }
                
            EV_SOC += (EV_charge_rate + EV_charge_rate_suppliment)
            
            balance -= EV_charge_rate
            balance -= EV_charge_rate_suppliment
                
            demand += EV_charge_rate   
            demand += EV_charge_rate_suppliment
        }
        else
        {
            // Simple night time charge alternative
            
            EV_kWhd = EV_miles_day / EV_miles_per_kwh
            // Manual charge profile set to night time charging
            //                                           1 1 1                   1 1
            //                       0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
            if (charge_type=="constantcharge")
                EV_charge_profile = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            if (charge_type=="nightcharge")
                EV_charge_profile = [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
            if (charge_type=="morenight")
                EV_charge_profile = [1,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
            if (charge_type=="moreday")
                EV_charge_profile = [1,1,1,1,1,1,1,1,2,2,3,3,4,4,4,3,3,2,1,1,1,1,1,1]
            // Calcuate profile factor
            EV_profile_factor = 0
            for (h in EV_charge_profile) EV_profile_factor += EV_charge_profile[h]
            EV_profile_scale = EV_kWhd / EV_profile_factor
            
            EV_charge_rate = EV_charge_profile[hour%24] * EV_profile_scale
            
            if ((EV_SOC+EV_charge_rate)>EV_battery_capacity) {
                EV_charge_rate = EV_battery_capacity - EV_SOC
            }
                
            EV_SOC += EV_charge_rate
            balance -= EV_charge_rate
            demand += EV_charge_rate
        }
        
        total_EV_demand += EV_charge_rate
        total_EV_demand += EV_charge_rate_suppliment

        // ---------------------------------------------------------------------------
        // Heatstore remaining supply
        // ---------------------------------------------------------------------------
        heatstore_charge = 0
        heatpump_elec_demand_heatstore = 0
        
        if (balance>=0) {
            heatpump_elec_demand_heatstore = balance;
            heatstore_charge = heatpump_elec_demand_heatstore * heatpump_COP
            
            if ((heatstore+heatstore_charge)>heatstore_capacity) {
                heatstore_charge = heatstore_capacity - heatstore 
            }
            heatpump_elec_demand_heatstore = heatstore_charge / heatpump_COP
            
            heatstore += heatstore_charge;
            
            balance -= heatpump_elec_demand_heatstore;
            demand += heatpump_elec_demand_heatstore
            total_heatpump_elec_demand += heatpump_elec_demand_heatstore
            total_heatpump_heat_demand += heatstore_charge
            total_heatstore_charge += heatstore_charge
        }
        
        // ---------------------------------------------------------------------------
        // Lithium ion store
        // ---------------------------------------------------------------------------
        liion_charge = 0
        liion_discharge = 0
        
        if (balance>0) {
            liion_charge = balance
            liion_charge_s2 = liion_charge * 0.92 // charge loss
            if ((liion_SOC+liion_charge_s2)>liion_capacity) {
                liion_charge_s2 = liion_capacity - liion_SOC;
            }
            liion_charge = liion_charge_s2 / 0.92
            
            liion_SOC += liion_charge_s2
            balance -= liion_charge
            total_liion_charge += liion_charge
            
            total_liion_losses += liion_charge * 0.08
        }
        /*
        if (balance<-1.0) {
            liion_discharge = -balance
            liion_discharge_s2 = liion_discharge / 0.92
            if ((liion_SOC-liion_discharge_s2)<0) {
                liion_discharge_s2 = liion_SOC;
            }
            liion_discharge = liion_discharge_s2 * 0.92
            liion_SOC -= liion_discharge_s2
            balance += liion_discharge
            total_liion_discharge += liion_discharge
        }*/
        
        // ---------------------------------------------------------------------------
        // Hydrogen production
        // ---------------------------------------------------------------------------
        // Efficiency of alkaline electrolyzer is 70%, Efficiency of PEM fuel cell is 47%
        // Hydrogen or batteries for grid storage? A net energy analysis
        // http://pubs.rsc.org/en/content/articlehtml/2015/ee/c4ee04041d
        
        electricity_for_electrolysis = 0
        H2_balance = 0
        
        if (balance>0) {
            electricity_for_electrolysis = balance
            // Electrolysis capacity limit
            if (electricity_for_electrolysis>electrolysis_capacity) electricity_for_electrolysis = electrolysis_capacity
            
            // 70% efficiency of hydrogen production
            H2_produced = electricity_for_electrolysis * 0.7
            H2_balance += H2_produced
            
            // Start by filling hydrogen store before going on to produce synthetic liquids and gas
            if ((H2_store_level+H2_produced)>H2_store_capacity) {
                H2_stored = H2_store_capacity - H2_store_level
            } else {
                H2_stored = H2_produced
            }
            H2_store_level += H2_stored
            H2_balance -= H2_stored
        }

        // ---------------------------------------------------------------------------
        // Hydrogen vehicles
        // ---------------------------------------------------------------------------
        H2_miles = EV_use_profile[hour%24] * (H2EV_annual_miles/365.0)
        H2EV_electrolysis_demand = (H2_miles / H2EV_miles_per_kwh)
        H2EV_hydrogen_demand = H2EV_electrolysis_demand * 0.7
        H2_balance -= H2EV_hydrogen_demand
        total_H2EV_hydrogen_demand += H2EV_hydrogen_demand
        total_H2EV_elec_demand += H2EV_electrolysis_demand
        
        // If hydrogen balance is negative pull H2 out of store
        if (H2_balance<0) {
            unmet_H2 = -1 * H2_balance
            H2V_draw_from_store = unmet_H2
            
            if (unmet_H2>H2_store_level)
                H2V_draw_from_store = H2_store_level
            
            H2_store_level -= H2V_draw_from_store
            total_H2V_draw_from_store += H2V_draw_from_store
            H2_balance += H2V_draw_from_store
        }
        // ---------------------------------------------------------------------------
        // Synthetic liquid fuel production Efficiency:53% 
        // ---------------------------------------------------------------------------
        // 2.0 kWh of biomass + 1.0 kWh of hydrogen = 1.6 kWh of synthetic liquid fuel
        if (H2_balance>0) {
            var H2_for_FT = H2_balance * FT_fraction
            var biomass_for_FT = H2_for_FT / 0.5
            var synthfuel = biomass_for_FT * 0.8
            
            if ((liquid_store_level+synthfuel)>liquid_store_capacity) {
                synthfuel = liquid_store_capacity - liquid_store_level
            }
            
            biomass_for_FT = synthfuel / 0.8
            H2_for_FT = biomass_for_FT * 0.5
            H2_balance -= H2_for_FT
            
            liquid_store_level += synthfuel
            total_H2_for_FT += H2_for_FT
            total_biomass_for_FT += biomass_for_FT
            total_synthfuel_production += synthfuel
            total_FT_losses += (synthfuel / (1.6/3.0)) - synthfuel
        }
        
        // ---------------------------------------------------------------------------
        // Synthetic methane production Efficiency:67% 
        // 1.43 kWh of electric input results in 1.0 kWh of backup electric: 70% but 2.0 kWh of biomass are also required
        // ---------------------------------------------------------------------------
        // 2.0 kWh of biomass + 1.0 kWh of hydrogen = 2.0 kWh of synthetic methane
        if (H2_balance>0) {
            var H2_for_sabatier = H2_balance * sabatier_fraction
            var biomass_for_sabatier = H2_for_sabatier * 2.0
            var methane = biomass_for_sabatier

            if ((methane_store_level+methane)>methane_store_capacity) {
                methane = methane_store_capacity - methane_store_level
            }
            biomass_for_sabatier = methane
            H2_for_sabatier = biomass_for_sabatier * 0.5
            H2_balance -= H2_for_sabatier
            
            methane_store_level += methane
            total_H2_for_sabatier += H2_for_sabatier
            total_biomass_for_sabatier += biomass_for_sabatier
            total_methane_production += methane
            total_sabatier_losses += (methane / (2/3)) - methane
        }

        
        if (H2_balance>0) {
            H2_unused = H2_balance
            // Work backwards to get the ammended electricity consumption
            electricity_for_electrolysis -= (H2_unused / 0.7)
        } else {
            total_unmet_H2_demand += -1 * H2_balance
            H2_balance = 0
        }
    
        // Subtract electric used for electrolysis from balance
        balance -= electricity_for_electrolysis
        total_electrolysis_demand += electricity_for_electrolysis
        total_electrolysis_losses += electricity_for_electrolysis * 0.3
        
        // ---------------------------------------------------------------------------
        // Internal Combustion Annual Miles
        // ---------------------------------------------------------------------------
        IC_miles = EV_use_profile[hour%24] * (IC_annual_miles/365.0)
        IC_liquid_demand = (IC_miles / IC_MPG) * 4.54609 * 9.7
        total_IC_liquid_demand += IC_liquid_demand
        
        // ---------------------------------------------------------------------------
        // Aviation demand distributed eavenly across the year
        // ---------------------------------------------------------------------------
        hourly_aviation_demand = (aviation_miles / aviation_miles_per_kwh) / (365.0 * 24.0)
        total_aviation_demand += hourly_aviation_demand
        
        // Industrial liquid fuel demand
        hourly_industry_liquid = 0
        if (industry_enable) hourly_industry_liquid = industry_liquid / (365*24)
        total_industry_liquid += hourly_industry_liquid
        
        // Liquid store
        liquid_demand = hourly_aviation_demand + synthfuel_for_heat + IC_liquid_demand + hourly_industry_liquid
        total_liquid_demand += liquid_demand
        
        if ((liquid_store_level-liquid_demand)<0) {
            unmet_liquid_demand += -1 * (liquid_store_level-liquid_demand)
            liquid_store_level = 0
        } else {
            liquid_store_level -= liquid_demand
        }
        
        // ---------------------------------------------------------------------------
        // Backup: H2 fuel cells
        // ---------------------------------------------------------------------------
        if (balance<0) {
            fuel_cell_output = -balance
            // Fuel cell capacity limit
            if (fuel_cell_output>fuel_cell_capacity) fuel_cell_output = fuel_cell_capacity
            // 47% efficiency of fuel cell
            H2_used = fuel_cell_output / 0.47
            // Low store level limit
            if (H2_used>H2_store_level) H2_used = H2_store_level
            fuel_cell_output = H2_used * 0.47
            // Remove hydrogen to store
            H2_store_level -= H2_used
            // Subtract electric used for electrolysis from balance
            balance += fuel_cell_output
            total_fuel_cell_output += fuel_cell_output;
        }
        
        // ---------------------------------------------------------------------------
        // Backup: Gas power stations
        // ---------------------------------------------------------------------------
        // Backup electricity is provided here by conventional gas turbines CCGT
        // running on synthetic methane or/and biogas. 
        // CCGT efficiency is assumed to be 50%
        unmet_before_CCGT = 0
        
        if (balance<0.0) {
            unmet_before_CCGT = -balance
            total_unmet_before_CCGT += -balance
        }
        
        // ---------------------------------------------------------------------------
        // 1) Calculate average backup demand in the last 24 hours
        //    run CCGT at this average amount providing positive balance at off peak times 
        //    to charge lithium ion short term stores and providing baseload at peak times
        //    so that lithium ion discharce only covers the peak rather than the baseload
        // ---------------------------------------------------------------------------
        
        average_hours = 24
        
        unmet = 0
        if (balance<0.0) unmet = balance * -1
        
        // Shift on one
        for (var i=(average_hours-1); i>0; i--) unmet_array[i] = unmet_array[i-1]
        unmet_array[i] = unmet
        
        // Calculate average
        unmet_sum = 0
        for (var i=0; i<average_hours; i++) unmet_sum += unmet_array[i]
        unmet_average = unmet_sum / average_hours
        
        if (liion_SOC<(liion_capacity*0.3)) unmet_average *= 1.1
        
        // ---------------------------------------------------------------------------
        // 2) Set CCGT turbines to average demand in last 24 hours
        // ---------------------------------------------------------------------------
        CCGT_methane = 0.0
        last_CCGT_output = CCGT_output
        CCGT_output = 0
        
        CCGT_output = unmet_average
        CCGT_output = CCGT_output / (1.0-grid_loss_prc)
        if (CCGT_output>CCGT_capacity) CCGT_output = CCGT_capacity
        CCGT_output = CCGT_output * (1.0-grid_loss_prc)
        balance += CCGT_output
        
        /*
        change_in_CCGT_output = CCGT_output-last_CCGT_output
        max_ramp_rate = 0.01
        // Maximum ramp up rate
        if (change_in_CCGT_output>(max_ramp_rate*CCGT_capacity)) change_in_CCGT_output = (max_ramp_rate*CCGT_capacity)
        // Maximum ramp down rate
        if (change_in_CCGT_output<(-1*max_ramp_rate*CCGT_capacity)) change_in_CCGT_output = (-1*max_ramp_rate*CCGT_capacity)
        // Limited ramp up/down output
        CCGT_output = last_CCGT_output + change_in_CCGT_output
        */
        
            
        // ---------------------------------------------------------------------------
        // 3) Recharge short term battery storage from CCGT
        // ---------------------------------------------------------------------------
        liion_charge = 0
        
        if (balance>0.0) {
            liion_charge = balance
            
            liion_charge_s2 = liion_charge * 0.92 // charge loss
            if ((liion_SOC+liion_charge_s2)>liion_capacity) {
                liion_charge_s2 = liion_capacity - liion_SOC;
            }
            liion_charge = liion_charge_s2 / 0.92
            
            liion_SOC += liion_charge_s2
            total_liion_charge += liion_charge
            balance -= liion_charge
            
            total_liion_losses += liion_charge * 0.08
        }
        
        // If CCGT output unused by lithium ion charge dont generate
        if (balance>0.0 && CCGT_output>0) {
            pre_CCGT_output = CCGT_output
            CCGT_output -= balance
            if (CCGT_output<0) CCGT_output =0
            unused_CCGT_output = pre_CCGT_output - CCGT_output
            balance -= unused_CCGT_output
            
        }
        
        CCGT_methane = CCGT_output / 0.5
        total_CCGT_output += CCGT_output
        total_CCGT_losses += CCGT_output
        total_grid_losses += CCGT_output * grid_loss_prc
        
        if (CCGT_output>max_CCGT_output) max_CCGT_output = CCGT_output
        CCGT_output_filter = CCGT_output_filter + 0.1 * (CCGT_output - CCGT_output_filter)

        // ---------------------------------------------------------------------------
        // 4) Peak reduction with lithium ion batteries
        // --------------------------------------------------------------------------- 
        if (balance<0.0) {
            liion_discharge = -balance
            liion_discharge_s2 = liion_discharge / 0.92
            if ((liion_SOC-liion_discharge_s2)<0) {
                liion_discharge_s2 = liion_SOC;
            }
            liion_discharge = liion_discharge_s2 * 0.92
            liion_SOC -= liion_discharge_s2
            balance += liion_discharge
            total_liion_discharge += liion_discharge
            
            total_liion_losses += liion_discharge * 0.08
        }
        
        // ---------------------------------------------------------------------------
        // 5) If balance is still negative use CCGT for final peaker backup
        // --------------------------------------------------------------------------- 
        CCGT_output_peaker = 0
        if (balance<0.0) {
            CCGT_output_peaker = -1 * balance
            CCGT_output_peaker = CCGT_output_peaker / (1.0-grid_loss_prc)
            if ((CCGT_output_peaker+CCGT_output)>CCGT_capacity) CCGT_output_peaker = CCGT_capacity - CCGT_output
            CCGT_output_peaker = CCGT_output_peaker * (1.0-grid_loss_prc)
            balance += CCGT_output_peaker
            
            CCGT_methane += CCGT_output_peaker / 0.5
            total_CCGT_output += CCGT_output_peaker
            total_CCGT_losses += CCGT_output_peaker
            total_grid_losses += CCGT_output_peaker * grid_loss_prc 
        }
        
        if ((CCGT_output+CCGT_output_peaker)>max_CCGT_output) max_CCGT_output = CCGT_output + CCGT_output_peaker
        
        
        // ---------------------------------------------------------------------------
        // Methane store demand
        // --------------------------------------------------------------------------- 
        
        // Industrial methane demand for high temperature processes 
        hourly_industry_gas = 0
        if (industry_enable) hourly_industry_gas = industry_gas / (365*24)
        total_industry_gas += hourly_industry_gas
        
        methane_demand = CCGT_methane + methane_for_heat + hourly_industry_gas
        total_methane_demand += methane_demand
        
        if ((methane_store_level-methane_demand)>=0) {
            methane_store_level -= methane_demand
        } else {
            unmet_methane_demand += (methane_demand - methane_store_level)
            methane_store_level = 0
        }
        
        // Industry solid demand
        hourly_industry_solid = 0
        if (industry_enable) hourly_industry_solid = industry_solid / (365*24)
        total_industry_solid += hourly_industry_solid
        
        // ---------------------------------------------------------------------------
        // Final balance
        // ---------------------------------------------------------------------------
        total_elec_demand += demand
        
        exess = 0
        
        if (balance>=0) {
            exess = balance
            exess_generation += balance
            hours_met += 1
        } else {
            unmet_elec_demand += -balance
        }

        var time = datastarttime + (hour * 3600 * 1000);
        data.supply.push([time,supply_after_grid_loss]);
        
        data.LAC.push([time,LAC_demand])
        data.HP.push([time,LAC_demand+heatpump_elec_demand])
        data.HPS.push([time,LAC_demand+heatpump_elec_demand+heatpump_elec_demand_heatstore])
        data.ECAR.push([time,LAC_demand+heatpump_elec_demand+heatpump_elec_demand_heatstore+EV_charge_rate])
        data.EH2.push([time,LAC_demand+heatpump_elec_demand+heatpump_elec_demand_heatstore+EV_charge_rate+electricity_for_electrolysis])
        
        data.liion_store_level.push([time,liion_SOC]);
        data.H2_store_level.push([time,liion_SOC+H2_store_level]);
        data.liquid_store_level.push([time,liion_SOC+H2_store_level+liquid_store_level]);
        data.methane_store_level.push([time,liion_SOC+H2_store_level+liquid_store_level+methane_store_level]);
        
        data.unmet_before_CCGT.push([time,unmet_before_CCGT])

        data.CCGT_output.push([time,CCGT_output]);
        data.CCGT_output_peaker.push([time,CCGT_output+CCGT_output_peaker]);
        data.liion_discharge.push([time,CCGT_output+CCGT_output_peaker+liion_discharge])
    }
    // ---------------------------------------------------------------------------
    // Less efficient provision of any unmet biogas and biofuels from biomass
    // without supplimentary hydrogen
    // ---------------------------------------------------------------------------
    total_biomass_for_direct_gas = 0
    total_direct_gas_losses =0
    if (supply_unmet_gas_from_direct_biomass) {
        total_biomass_for_direct_gas = unmet_methane_demand/0.6
        total_direct_gas_losses = total_biomass_for_direct_gas - unmet_methane_demand
        unmet_methane_demand = 0
    }
    
    total_biomass_for_direct_liquid = 0
    total_direct_liquid_losses = 0
    if (supply_unmet_liquid_from_direct_biomass) {
        total_biomass_for_direct_liquid = unmet_liquid_demand/0.5
        total_direct_liquid_losses = total_biomass_for_direct_liquid - unmet_liquid_demand
        unmet_liquid_demand = 0
    }
    
    // ---------------------------------------------------------------------------
    // Final totals section
    // ---------------------------------------------------------------------------
    
    // LAC
    lighting_utilisation = 100 * total_lighting_demand / (number_of_lights * lights_power * 0.024 * 365 * 10) 
    
    // Hot Water Heating
    DHW_heatpump_demand = total_DHW_heat_demand / heatpump_COP
    
    // Space Heating
    average_temperature = average_temperature / hours
    used_metabolic_gains = total_metabolic_gains - total_metabolic_gains_unused
    used_solar_gains = total_solar_gains - total_solar_gains_unused
    used_internal_gains = total_internal_gains - total_internal_gains_unused
    
    spaceheatkwhm2 = (total_final_space_heating_demand*0.1) / total_floor_area
    
    // Heating systems and heatstore
    heatstore_cycles = 0
    if (heatstore_capacity>0)
        heatstore_cycles = total_heatstore_charge / heatstore_capacity
    
    // Hydrogen
    total_H2_produced = total_electrolysis_demand * 0.7
    
    // Biomass and synthetic fuels -------------------------------------------------
    landarea_per_household = 9370 // m2 x 26 million households is 24 Mha
    
    // Liquid
    // 1.0725 based on 50% miscanthus and 50% SRC with 50% increase increase in yields
    biomass_landarea_factor = ((1.0/3650)/0.024) / 1.0725
    landarea_for_FT = total_biomass_for_FT * biomass_landarea_factor
    prc_landarea_for_FT = 100 * landarea_for_FT / landarea_per_household

    // less efficient direct method
    landarea_for_direct_liquid = total_biomass_for_direct_liquid * biomass_landarea_factor
    prc_landarea_for_direct_liquid = 100 * landarea_for_direct_liquid / landarea_per_household

    // Gas: Methane
    biomass_landarea_factor = ((1.0/3650)/0.024) / 0.51;
    landarea_for_sabatier = total_biomass_for_sabatier * biomass_landarea_factor
    prc_landarea_for_sabatier = 100 * landarea_for_sabatier / landarea_per_household
    
    // less efficient direct method
    landarea_for_direct_gas = total_biomass_for_direct_gas * biomass_landarea_factor
    prc_landarea_for_direct_gas = 100 * landarea_for_direct_gas / landarea_per_household
    
    // Solid: wood chips, pellets & logs
    // 0.975 based on 100% SRC with 50% increase in yields
    biomass_landarea_factor = ((1.0/3650)/0.024) / 0.975;
    landarea_for_solid = (total_biomassboiler_biomass_demand + total_industry_solid) * biomass_landarea_factor
    prc_landarea_for_solid = 100 * landarea_for_solid / landarea_per_household
    
    // Total biomass land area required
    biomass_requirement = total_biomass_for_FT + total_biomass_for_sabatier + total_biomassboiler_biomass_demand + total_biomass_for_direct_gas + total_biomass_for_direct_liquid + total_industry_solid
    biomass_m2 = landarea_for_FT + landarea_for_sabatier + landarea_for_solid + landarea_for_direct_gas + landarea_for_direct_liquid
    prc_landarea_for_biomass = 100 * biomass_m2 / landarea_per_household
    
    // Overall transport
    total_transport_demand = total_EV_demand + total_H2EV_hydrogen_demand + total_IC_liquid_demand + total_aviation_demand + total_ebike_demand + total_train_demand
    
    // Elec supply / demand matching
    prc_elec_demand_supplied = ((total_elec_demand - unmet_elec_demand) / total_elec_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100

    // Overall energy supply / demand matching
    total_supply = total_elec_supply + biomass_requirement
    
    total_demand = total_elec_demand + total_aviation_demand + total_H2EV_hydrogen_demand + total_IC_liquid_demand
    total_demand += total_gasboiler_gas_demand + total_biomassboiler_biomass_demand + total_synthfuelboiler_fuel_demand
    total_demand += total_industry_gas + total_industry_liquid + total_industry_solid + total_industry_hydrogen 
    
    primary_energy_factor = total_supply / total_demand
                                                                                                          // introducing these adds an error in the final balance
    final_store_levels = liion_SOC + H2_store_level + liquid_store_level + methane_store_level            // + EV_SOC
    starting_store_levels = (1*liion_SOC_start) + (1*H2_store_start) + (1*methane_store_start) + (1*liquid_store_start)   // + EV_SOC_start
    total_exess = exess_generation + final_store_levels - starting_store_levels
    total_losses = total_electrolysis_losses + total_CCGT_losses + total_FT_losses + total_sabatier_losses + total_grid_losses + total_direct_gas_losses + total_direct_liquid_losses + total_liion_losses
    total_unmet_demand = unmet_elec_demand + unmet_methane_demand + unmet_liquid_demand + unmet_demand_atuse

    prc_demand_supplied_all = (((total_demand+total_losses) - total_unmet_demand) / (total_demand+total_losses)) * 100

    // ----------------------------------------------------------------------------
    // Embodied Energy
    // ----------------------------------------------------------------------------
    // http://pubs.rsc.org/en/content/articlehtml/2015/ee/c4ee04041d#eqn24
    // Solar EROI = 8, assuming 25 years, 2740 kWh/kWp
    // http://info.cat.org.uk/questions/pv/what-energy-and-carbon-payback-time-pv-panels-uk/
    // Emodied energy of 1kWp about 2200 kWh/kWp
    
    // Wind EROI = 86, assuming 20 years, 713 kWh/kWp

    embodied_energy_kwhd = 0
    
    EE_onshorewind = ((onshorewind_capacity * 1500) / (20 * 365))
    embodied_energy_kwhd += EE_onshorewind
    EE_offshorewind = ((offshorewind_capacity * 1800) / (20 * 365))
    embodied_energy_kwhd += EE_offshorewind
    EE_solarpv = ((solarpv_capacity * 2200) / (30 * 365))
    embodied_energy_kwhd += EE_solarpv
    
    EE_liion_store = (((liion_capacity * 136.0) / 6000 * 0.8) * total_liion_charge)/3650
    embodied_energy_kwhd += EE_liion_store
    EE_ecarbattery = ((EV_battery_capacity * 136.0) / ((135000.0/EV_annual_miles) * 365))
    embodied_energy_kwhd += EE_ecarbattery
    
    EE_ecar = 0
    if (EV_annual_miles>0)
        EE_ecar = (24000 / (135000.0/EV_annual_miles)) / 365
        
    embodied_energy_kwhd += EE_ecar
    
    // ----------------------------------------------------------------------------
    // Scaled up to village, town, country scale
    // ----------------------------------------------------------------------------
    scaled_onshorewind_capacity = onshorewind_capacity * number_of_households
    scaled_offshorewind_capacity = offshorewind_capacity * number_of_households
    scaled_solarpv_capacity = solarpv_capacity * number_of_households  
    scaled_hydro_capacity = hydro_capacity * number_of_households    
    scaled_tidal_capacity = tidal_capacity * number_of_households   
    scaled_wave_capacity = wave_capacity * number_of_households   
    scaled_nuclear_capacity = nuclear_capacity * number_of_households   
    scaled_CCGT_capacity = CCGT_capacity * number_of_households
    
    scaled_electrolysis_capacity = electrolysis_capacity * number_of_households
          
    scaled_landarea_for_gas = (landarea_for_sabatier + landarea_for_direct_gas) * number_of_households
    scaled_landarea_for_liquid = (landarea_for_FT + landarea_for_direct_liquid) * number_of_households
    scaled_landarea_for_solid = landarea_for_solid * number_of_households
    scaled_biomass_m2 = biomass_m2 * number_of_households
    
    scaled_H2_store_capacity = H2_store_capacity * number_of_households
    scaled_liquid_store_capacity = liquid_store_capacity * number_of_households
    scaled_methane_store_capacity = methane_store_capacity * number_of_households
    
    scaled_total_LAC_elec_demand = (total_LAC_elec_demand/10) * number_of_households
    scaled_total_heatpump_elec_demand = (total_heatpump_elec_demand/10) * number_of_households
    scaled_total_EV_demand = (total_EV_demand/10) * number_of_households
    scaled_total_electrolysis_demand = (total_electrolysis_demand/10) * number_of_households
    scaled_exess_generation = (exess_generation/10) * number_of_households
    scaled_total_liquid_demand = (total_liquid_demand/10) * number_of_households
    
    
    $(".modeloutput").each(function(){
        var type = $(this).attr("type");
        var key = $(this).attr("key");
        var dp = $(this).attr("dp");
        var scale = $(this).attr("scale");
        var units = $(this).attr("units");
        
        if (type==undefined) {
            if (scale==undefined) scale = 1;
            if (units==undefined) units = ""; else units = " "+units;
        } else if(type=="10y") {
            if (unitsmode=="kwhd") {
                scale = 1.0 / 3650
                units = " kWh/d"
                dp = 1
            } else if (unitsmode=="kwhy") {
                scale = 1.0 / 10
                units = " kWh/y"
                dp = 0
            }
        } else if(type=="1y") {
            if (unitsmode=="kwhd") {
                scale = 1.0 / 365
                units = " kWh/d"
                dp = 1
            } else if (unitsmode=="kwhy") {
                scale = 1.0
                units = " kWh/y"
                dp = 0
            }
        } else if(type=="1d") {
            if (unitsmode=="kwhd") {
                scale = 1.0
                units = " kWh/d"
                dp = 2
            } else if (unitsmode=="kwhy") {
                scale = 1.0 * 365
                units = " kWh/y"
                dp = 0
            }
        } else if(type=="auto") {
            var baseunit = $(this).attr("baseunit");
            
            if (baseunit=="kW") {
                scale = 1; units = " kW"; dp = 0;
                if (window[key]>=10000) {scale=0.001; units=" MW"; dp=0;}
                if (window[key]>=10000000) {scale=0.000001; units=" GW"; dp=0;}
            }
            
            if (baseunit=="kWh") {
                scale = 1; units = " kWh"; dp = 0;
                if (window[key]>=10000) {scale=0.001; units=" MWh"; dp=0;}
                if (window[key]>=10000000) {scale=0.000001; units=" GWh"; dp=0;}
                if (window[key]>=10000000000) {scale=0.000000001; units=" TWh"; dp=0;}
            }

            if (baseunit=="m2") {
                scale = 1; units = " m2"; dp = 0;
                if (window[key]>=10000*10) {scale=0.0001; units=" ha"; dp=0;}
                if (window[key]>=10000*10*1000) {scale=0.0001*0.001; units=" kha"; dp=0;}
                if (window[key]>=10000*10*1000*1000) {scale=0.0001*0.001*0.001; units=" Mha"; dp=0;}
            } 
        }
        
        $(this).html("<span>"+(1*window[key]*scale).toFixed(dp)+"</span><span style='font-size:90%'>"+units+"</span>");
    });
    

    // Final balance and error printed to console
    console.log("TOTAL SUPPLY: "+(total_supply + total_unmet_demand))
    console.log("TOTAL DEMAND: "+(total_demand + total_losses + total_exess))
    console.log("ERROR: "+((total_supply+total_unmet_demand)-(total_demand+total_losses+total_exess)))
    console.log("ERROR: "+((total_supply+total_unmet_demand)-(total_demand+total_losses+total_exess))/3650)
    
    // Energy stacks visualisation definition
    var stacks = [
      {"name":"Supply","height":(total_supply+total_unmet_demand)/3650,"saving":0,
        "stack":[
          {"kwhd":total_supply/3650,"name":"Supply","color":1},
          {"kwhd":total_unmet_demand/3650,"name":"Unmet","color":3}
        ]
      },
      {"name":"Supply","height":(total_supply+total_unmet_demand)/3650,"saving":0,
        "stack":[
          {"kwhd":total_offshore_wind_supply/3650,"name":"Offshore Wind","color":1},
          {"kwhd":total_onshore_wind_supply/3650,"name":"Onshore Wind","color":1},
          {"kwhd":total_solar_supply/3650,"name":"Solar PV","color":1},
          {"kwhd":total_wave_supply/3650,"name":"Wave","color":1},
          {"kwhd":total_tidal_supply/3650,"name":"Tidal","color":1},
          {"kwhd":total_hydro_supply/3650,"name":"Hydro","color":1},
          {"kwhd":total_nuclear_supply/3650,"name":"Nuclear","color":1},
          {"kwhd":biomass_requirement/3650,"name":"Biomass","color":1},
          {"kwhd":total_unmet_demand/3650,"name":"Unmet","color":3}
          
        ]
      },
      {"name":"Demand","height":(total_demand+total_losses+total_exess)/3650,"saving":0,
        "stack":[
          {"kwhd":total_demand/3650,"name":"Demand","color":0},
          {"kwhd":total_losses/3650,"name":"Losses","color":2},
          {"kwhd":total_exess/3650,"name":"Exess","color":3}
        ]
      },
      
      {"name":"Demand","height":(total_demand+total_losses)/3650,"saving":0,
        "stack":[
          {"kwhd":total_LAC_elec_demand/3650,"name":"LAC","color":0},
          {"kwhd":total_heatpump_elec_demand/3650,"name":"Heatpumps","color":0},
          {"kwhd":total_gasboiler_gas_demand/3650,"name":"Gas Boiler","color":0},
          {"kwhd":total_synthfuelboiler_fuel_demand/3650,"name":"Synth Fuel Boiler","color":0},
          {"kwhd":total_biomassboiler_biomass_demand/3650,"name":"Biomass Boiler","color":0},
          {"kwhd":total_EV_demand/3650,"name":"Electric Cars","color":0},
          {"kwhd":total_H2EV_hydrogen_demand/3650,"name":"Hydrogen Cars","color":0},
          {"kwhd":total_IC_liquid_demand/3650,"name":"IC Cars","color":0},
          {"kwhd":total_aviation_demand/3650,"name":"Aviation","color":0},
          {"kwhd":total_train_demand/3650,"name":"E-Trains","color":0},
          {"kwhd":total_ebike_demand/3650,"name":"E-Bikes","color":0},
          // Industry
          {"kwhd":total_industry_electric/3650,"name":"Industry Electric","color":0},
          {"kwhd":total_industry_gas/3650,"name":"Industry Gas","color":0},
          {"kwhd":total_industry_liquid/3650,"name":"Industry Liquid","color":0},
          {"kwhd":total_industry_solid/3650,"name":"Industry Biomass","color":0},
          // Backup, liquid and gas processes
          {"kwhd":total_electrolysis_losses/3650,"name":"H2 losses","color":2},
          {"kwhd":total_CCGT_losses/3650,"name":"CCGT losses","color":2},
          {"kwhd":total_FT_losses/3650,"name":"FT losses","color":2},
          {"kwhd":total_sabatier_losses/3650,"name":"Sabatier losses","color":2},
          {"kwhd":total_direct_gas_losses/3650,"name":"Direct gas loss","color":2},
          {"kwhd":total_direct_liquid_losses/3650,"name":"Direct liquid loss","color":2},
          {"kwhd":total_grid_losses/3650,"name":"Grid losses","color":2},
          {"kwhd":total_liion_losses/3650,"name":"Liion losses","color":2},
          {"kwhd":total_exess/3650,"name":"Exess","color":3}
        ]
      }
    ];
    draw_stacks(stacks,"stacks",1000,600,"kWh/d")    
}
// ---------------------------------------------------------------------------    
	
function fullhousehold_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    if (view_mode=="")
    {
        $.plot("#placeholder", [
            /*
            // LAC_demand + heatpump + ev
            {label: "EV charging demand", data:dataout[4], yaxis:1, color:"#aac15b", lines: {lineWidth:0, fill: 1.0 }}, 
            // LAC_demand + heatpump
            {label: "Heatpump electric demand", data:dataout[3], yaxis:1, color:"#cc6622", lines: {lineWidth:0, fill: 1.0 }},
            {label: "DHW Heatpump electric demand", data:dataout[2], yaxis:1, color:"#cc4400", lines: {lineWidth:0, fill: 1.0 }},
            // LAC_demand
            {label: "Traditional electric demand", data:dataout[1], yaxis:1, color:"#00aacc", lines: {lineWidth:0, fill: 1.0 }}, 
            // EV SOC
            {label: "EV SOC", data:dataout[5], yaxis:2, color:"#cc0000", lines: {lineWidth:1, fill: false }},
            // supply
            */
            
            {label: "Electrolysis", data:dataout.EH2, yaxis:1, color:"#00aacc", lines: {lineWidth:0, fill: 1.0 }},
            {label: "EV", data:dataout.ECAR, yaxis:1, color:"#aac15b", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Heatpump Heatstore", data:dataout.HPS, yaxis:1, color:"#cc3311", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Heatpumps", data:dataout.HP, yaxis:1, color:"#cc6622", lines: {lineWidth:0, fill: 1.0 }},
            {label: "LAC", data:dataout.LAC, yaxis:1, color:"#0066cc", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Supply", data:dataout.supply, yaxis:1, color:"#000000", lines: {lineWidth:0.2, fill: false }},

            ], {
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                yaxes: [{},{min: 0, max: 100},{}],
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
    }

    if (view_mode=="stores")
    {
        $.plot("#placeholder", [
            {label: "Methane Store", data:dataout.methane_store_level, yaxis:3, color:"#ccaa00", lines: {lineWidth:0, fill: 0.8 }},
            {label: "Liquid Store", data:dataout.liquid_store_level, yaxis:3, color:"#8533e1", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Hydrogen Store", data:dataout.H2_store_level, yaxis:3, color:"#97b5e7", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Lithium Ion Store", data:dataout.liion_store_level, yaxis:3, color:"#1960d5", lines: {lineWidth:0, fill: 1.0 }}

            ], {
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                yaxes: [{},{min: 0, max: 100},{}],
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
    }
    
    if (view_mode=="backup")
    {
        $.plot("#placeholder", [
            {label: "Lithium ion discharge", data:dataout.liion_discharge, yaxis:1, color:"#0000ff", lines: {lineWidth:0, fill: 0.5 }},
            {label: "CCGT output peaker", data:dataout.CCGT_output_peaker, yaxis:1, color:"#ddbb00", lines: {lineWidth:0, fill: 1.0 }},
            {label: "CCGT output", data:dataout.CCGT_output, yaxis:1, color:"#ccaa00", lines: {lineWidth:0, fill: 1.0 }},
            // {label: "CCGT output filter", data:dataout.CCGT_output_filter, yaxis:1, color:"#ff0000", lines: {lineWidth:1, fill:false }},
            {label: "Lithium Ion Store", data:dataout.liion_store_level, yaxis:2, color:"#1960d5", lines: {lineWidth:1, fill: false }},
            {label: "Unmet before CCGT", data:dataout.unmet_before_CCGT, yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},
            // {label: "Unmet sum", data:dataout.unmet_sum, yaxis:1, color:"#0000ff", lines: {lineWidth:1, fill: false }}

            ], {
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                yaxes: [{},{min: 0, max: 100},{}],
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
    }
}
