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
13. Gas turbines for backup

- electric trains
- hydrogen vehicles
- biofuel vehicles
- biofuel aircraft

*/


function national_init()
{
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

    // ---------------------------------------------------------------------------
    traditional_electric = 1642
    hourly_traditional_electric = traditional_electric / 8764.8

    // ---------------------------------------------------------------------------
    // Domestic Hot Water Demand
    // ---------------------------------------------------------------------------
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
    heatpump_COP = 3.0

    heatstore_capacity = 10
    heatstore = heatstore_capacity * 0.5

    // ---------------------------------------------------------------------------
    // EV performance and battery capacity
    // miles per kwh includes charge/discharge efficiency of battery (to simplify model)
    EV_miles_per_kwh = 4.0
    EV_battery_capacity = 24.0
    EV_SOC = EV_battery_capacity * 0.5

    EV_annual_miles = 6100;
    // Electric vehicle use profile ( miles )
    //                                    1 1 1                   1 1
    //                0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
    EV_use_profile = [0,0,0,0,0,0,0,2,7,3,0,0,1,1,0,0,0,7,2,2,2,0,0,0]

    // Calculate total miles per day travelled
    EV_miles_day = 0; for (h in EV_use_profile) EV_miles_day += EV_use_profile[h]
    // Normalise
    for (h in EV_use_profile) EV_use_profile[h] = (EV_use_profile[h] / EV_miles_day)

    // ---------------------------------------------------------------------------
    liion_capacity = 0
    liion_SOC = liion_capacity * 0.5
    // ---------------------------------------------------------------------------
    electrolysis_capacity = 2.0
    fuel_cell_capacity = 1.0
    
    H2_store_capacity = 10.0
    H2_store_level = 0
    
    FT_fraction = 1.0
    liquid_store_capacity = 280.0
    liquid_store_level = 0
    
    sabatier_fraction = 1.0
    methane_store_capacity = 4400.0
    methane_store_level = 0
    
    CCGT_capacity = 2.0
    
    // Aviation
    aviation_miles_per_kwh = 1.3  // passenger miles per kwh based on 50 kWh per 100p/km
    aviation_miles = 1200 
    
    view_mode = "supplydemand"
    
    $("#view-stores").click(function(){
        view_mode = "stores"
    });
}
function national_run()
{
    total_offshore_wind_supply = 0
    total_onshore_wind_supply = 0
    total_solar_supply = 0
    total_wave_supply = 0
    total_tidal_supply = 0
    total_hydro_supply = 0
    total_nuclear_supply = 0
    
    total_supply = 0
    total_demand = 0
 
 
    total_trad_elec_demand = 0

    // DHW Demand
    DHW_daily_demand = 0
    DHW_daily_demand += (shower_kwh * number_showers_per_day)
    DHW_daily_demand += (bath_kwh * number_baths_per_day)
    DHW_daily_demand += (sink_kwh * number_kitchen_sink)
    DHW_daily_demand += (sink_kwh * number_bathroom_sink)
    
    total_DHW_heat_demand = 0
    total_DHW_heatpump_elec_demand = 0
    
    total_EV_demand = 0
    total_heat_demand = 0
    total_internal_gains_unused = 0
    total_solar_gains = 0
    total_solar_gains_unused = 0
    total_heating_demand = 0
    
    total_heatpump_heat_demand = 0
    total_heatpump_demand = 0
    
    average_temperature = 0

    exess_generation = 0
    unmet_demand = 0
    unmet_demand_atuse = 0
    hours_met = 0
    total_miles_driven = 0
    
    total_liion_charge = 0
    total_liion_discharge = 0
    
    total_electrolysis_demand = 0
    total_electrolysis_losses = 0
    total_fuel_cell_output = 0
    
    biomass_requirement = 0
    total_synthfuel_production = 0
    total_methane_production = 0
    unmet_methane_demand = 0
    total_CCGT_output = 0
    total_unmet_before_CCGT = 0
    total_CCGT_losses = 0
    
    H2_store_level = 0
    liquid_store_level = 50
    methane_store_level = 300
    
    unmet_aviation_demand = 0
    unmet_liquid_demand = 0
    total_aviation_demand = 0
    
    total_FT_losses = 0
    total_sabatier_losses = 0

    data = [];
    data[0] = [];
    data[1] = [];
    data[2] = [];
    data[3] = [];
    data[4] = [];

    // ---------------------------------------------------------------------------------------------  
    // Building energy model
    // ---------------------------------------------------------------------------------------------
    // 2. Metabolic gains
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
        total_supply += supply

        total_offshore_wind_supply += offshorewind
        total_onshore_wind_supply += onshorewind
        total_solar_supply += solarpv
        total_wave_supply += wave
        total_tidal_supply += tidal
        total_hydro_supply += hydro
        total_nuclear_supply += nuclear

        balance = supply
        demand = 0

        // ---------------------------------------------------------------------------
        // Traditional electricity demand
        // ---------------------------------------------------------------------------
        trad_demand_factor = capacityfactors[5] / total_trad_demand
        tradelec = trad_demand_factor * traditional_electric * 10
        balance -= tradelec
        demand += tradelec
        total_trad_elec_demand += tradelec

        // ---------------------------------------------------------------------------
        // Hot water demand
        // ---------------------------------------------------------------------------

        DHW_demand = DHW_profile[hour%24] * DHW_daily_demand
        DHW_heatpump_elec_demand = DHW_demand / heatpump_COP

        balance -= DHW_heatpump_elec_demand
        demand += DHW_heatpump_elec_demand
        
        total_DHW_heat_demand += DHW_demand
        total_DHW_heatpump_elec_demand += DHW_heatpump_elec_demand

        // ---------------------------------------------------------------------------
        // Space Heating
        // ---------------------------------------------------------------------------
        // External temperature        
        average_temperature += temperature
        
        // 1) Total heat demand
        deltaT = target_internal_temperature - temperature
        heating_demand = fabric_efficiency * deltaT
        
        if (heating_demand>0) {
            total_heat_demand += heating_demand
        } else {
            heating_demand = 0
        }
            
        // 2) Subtract estimate for other internal gains
        if ((heating_demand-tradelec)>=0) {
            heating_demand -= tradelec
        } else {
            total_internal_gains_unused += (tradelec - heating_demand)
            heating_demand = 0
        }
            
        // 3) Calc solar gains and subtract from heat demand
        solar_gains = parseFloat(capacityfactors[4]) * solar_gains_capacity
        total_solar_gains += solar_gains
        
        if ((heating_demand-solar_gains)>=0) {
            heating_demand -= solar_gains
        } else {
            total_solar_gains_unused += (solar_gains - heating_demand)
            heating_demand = 0
        }
            
        total_heating_demand += heating_demand
        
        if (heatstore>heating_demand) {
            heatstore_discharge = heating_demand;
            heatstore -= heatstore_discharge;
            heating_demand = 0;
        } else {
            heating_demand -= heatstore;
            heatstore_discharge = heatstore;
            heatstore = 0;
        }
        
        heatpump_electricity_demand = heating_demand / heatpump_COP

        balance -= heatpump_electricity_demand
        demand += heatpump_electricity_demand
        total_heatpump_demand += heatpump_electricity_demand
        total_heatpump_heat_demand += heating_demand
        
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
        total_miles_driven += miles

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
        total_EV_demand += EV_charge_rate
        total_EV_demand += EV_charge_rate_suppliment
        /*
        // Simple night time charge alternative
        
        EV_kWhd = EV_miles_day / EV_miles_per_kwh
        // Manual charge profile set to night time charging
        //                                        1 1 1                   1 1
        //                    0 1 2 3 4 5 6 7 8 9 0 1 2 1 2 3 4 5 6 7 8 9 0 1
        EV_charge_profile = [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        
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
        */
        // ---------------------------------------------------------------------------
        // Heatstore remaining supply
        // ---------------------------------------------------------------------------
        heatstore_charge = 0
        heatpump_electricity_demand_heatstore = 0
        
        if (balance>=0) {
            heatpump_electricity_demand_heatstore = balance;
            heatstore_charge = heatpump_electricity_demand_heatstore * heatpump_COP;
            
            if ((heatstore+heatstore_charge)>heatstore_capacity) {
                heatstore_charge = heatstore_capacity - heatstore 
            }
            heatpump_electricity_demand_heatstore = heatstore_charge / heatpump_COP;
            
            heatstore += heatstore_charge;
            
            balance -= heatpump_electricity_demand_heatstore;
            demand += heatpump_electricity_demand_heatstore
            total_heatpump_demand += heatpump_electricity_demand_heatstore
            total_heatpump_heat_demand += heatstore_charge
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
            
        } else {
            liion_discharge = -balance
            liion_discharge_s2 = liion_discharge / 0.92
            if ((liion_SOC-liion_discharge_s2)<0) {
                liion_discharge_s2 = liion_SOC;
            }
            liion_discharge = liion_discharge_s2 * 0.92
            liion_SOC -= liion_discharge_s2
            balance += liion_discharge
            total_liion_discharge += liion_discharge
        }
        
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
            
            liquid_store_level += synthfuel
            H2_balance -= H2_for_FT
            biomass_requirement += biomass_for_FT
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
            
            methane_store_level += methane
            H2_balance -= H2_for_sabatier
            biomass_requirement += biomass_for_sabatier
            total_methane_production += methane
            total_sabatier_losses += (methane / (2/3)) - methane
        }

        // ---------------------------------------------------------------------------
        // Hydrogen storage
        // ---------------------------------------------------------------------------
        if (H2_balance>0) {
            H2_stored = H2_balance;
            // Limit on hydrogen production if store is full
            if ((H2_store_level+H2_stored)>H2_store_capacity) {
                H2_stored = H2_store_capacity - H2_store_level
            }
            H2_unused = H2_balance - H2_stored
            
            // Work backwards to get the ammended electricity consumption
            electricity_for_electrolysis -= (H2_unused / 0.7)
            
            // Add hydrogen to store
            H2_store_level += H2_stored
        }
    
        // Subtract electric used for electrolysis from balance
        balance -= electricity_for_electrolysis
        total_electrolysis_demand += electricity_for_electrolysis
        total_electrolysis_losses += electricity_for_electrolysis * 0.3
        // ---------------------------------------------------------------------------
        // Aviation demand distributed eavenly across the year
        // ---------------------------------------------------------------------------
        var hourly_aviation_demand = (aviation_miles / aviation_miles_per_kwh) / (365.0 * 24.0)
        total_aviation_demand += hourly_aviation_demand
        
        if ((liquid_store_level-hourly_aviation_demand)<0) {
            unmet_liquid_demand += -1 * (liquid_store_level-hourly_aviation_demand)
            liquid_store_level = 0
        } else {
            liquid_store_level -= hourly_aviation_demand
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
        if (balance<0) {
            total_unmet_before_CCGT += -balance
        
            CCGT_output = -balance
            if (CCGT_output>CCGT_capacity) CCGT_output = CCGT_capacity
            
            CCGT_methane = CCGT_output / 0.5
            
            if ((methane_store_level-CCGT_methane)<0) {
               unmet_methane_demand += (CCGT_methane - methane_store_level)
               CCGT_methane = methane_store_level
            }
            
            CCGT_output = CCGT_methane * 0.5
            
            methane_store_level -= CCGT_methane
            balance += CCGT_output
            total_CCGT_output += CCGT_output
            total_CCGT_losses += CCGT_output
        }
        
        
        // ---------------------------------------------------------------------------
        // Final balance
        // ---------------------------------------------------------------------------
        total_demand += demand
        
        exess = 0
        if (balance>=0) {
            exess = balance
            exess_generation += balance
            hours_met += 1
        } else {
            unmet_demand += -balance
        }

        var time = datastarttime + (hour * 3600 * 1000);
        data[0].push([time,supply]);
        data[1].push([time,tradelec]);
        data[2].push([time,tradelec+heatpump_electricity_demand+heatpump_electricity_demand_heatstore]);
        data[3].push([time,tradelec+heatpump_electricity_demand+heatpump_electricity_demand_heatstore+EV_charge_rate]);
        data[4].push([time, 100*(EV_SOC/EV_battery_capacity)]);
        // data[2].push([time,heating_demand+heatstore_discharge]);
        
        // d1.push([hour,100*(liion_SOC/liion_capacity)]); // 100*(EV_SOC/24)
        //d1.push([hour, 100*(EV_SOC/24)]); // 100*(EV_SOC/24)
        //d2.push([hour,supply]);
        //d3.push([hour,tradelec]);
        //d4.push([hour,heatpump_electricity_demand+heatpump_electricity_demand_heatstore]);
        //d5.push([hour,EV_charge_rate]);
        // d5.push([hour,EV_charge_rate_suppliment+EV_charge_rate]);
    }
    
    total_DHW_heatpump_elec_demand_kwhd = total_DHW_heatpump_elec_demand / 3650
    spaceheatkwhm2 = (total_heatpump_heat_demand*0.1) / total_floor_area
    
    var biomass_landarea_factor = ((1.0/3650)/0.024) / 0.7;
    
    total_H2_produced = total_electrolysis_demand * 0.7
    biomass_for_synthfuel = total_synthfuel_production / 0.8
    hydrogen_for_synthfuel = biomass_for_synthfuel * 0.5
    landarea_for_synthfuel = biomass_for_synthfuel * biomass_landarea_factor
    prc_landarea_for_synthfuel = 100 * landarea_for_synthfuel / 1160

    biomass_for_methane = total_methane_production
    hydrogen_for_methane = biomass_for_methane * 0.5
    landarea_for_methane = biomass_for_methane * biomass_landarea_factor
    prc_landarea_for_methane = 100 * landarea_for_methane / 1160
    
    biomass_m2 = biomass_requirement * biomass_landarea_factor
    prc_landarea_for_biomass = 100 * biomass_m2 / 1160
    
    average_temperature = average_temperature / hours

    used_solar_gains = total_solar_gains - total_solar_gains_unused
    
    total_internal_gains = traditional_electric*10
    used_internal_gains = total_internal_gains - total_internal_gains_unused

    prc_demand_supplied = ((total_demand - unmet_demand) / total_demand) * 100
    prc_time_met = (1.0 * hours_met / hours) * 100

    total_supply_inc_biomass = total_supply+biomass_requirement;
    total_supply_inc_biomass_kwhd = total_supply_inc_biomass / 3650;

    total_demand_inc_aviation = total_demand+total_aviation_demand
    total_demand_inc_aviation_kwhd = total_demand_inc_aviation / 3650;
    
    primary_energy_factor = total_supply_inc_biomass / total_demand_inc_aviation
    
    total_losses = total_electrolysis_losses + total_CCGT_losses + total_FT_losses + total_sabatier_losses
    
    $(".modeloutput").each(function(){
        var key = $(this).attr("key");
        var dp = $(this).attr("dp");
        var scale = $(this).attr("scale");
        if (scale==undefined) scale = 1;
        var units = $(this).attr("units");
        if (units==undefined) units = ""; else units = " "+units;
        $(this).html((1*window[key]*scale).toFixed(dp)+units);
    });
    
    var stacks = [
      {"name":"Supply","height":total_supply_inc_biomass_kwhd,"saving":0,
        "stack":[
          {"kwhd":total_supply_inc_biomass_kwhd,"name":"Supply","color":1}
        ]
      },
      {"name":"Supply","height":total_supply_inc_biomass_kwhd,"saving":0,
        "stack":[
          {"kwhd":total_offshore_wind_supply/3650,"name":"Offshore Wind","color":1},
          {"kwhd":total_onshore_wind_supply/3650,"name":"Onshore Wind","color":1},
          {"kwhd":total_solar_supply/3650,"name":"Solar PV","color":1},
          {"kwhd":total_wave_supply/3650,"name":"Wave","color":1},
          {"kwhd":total_tidal_supply/3650,"name":"Tidal","color":1},
          {"kwhd":total_hydro_supply/3650,"name":"Hydro","color":1},
          {"kwhd":total_nuclear_supply/3650,"name":"Nuclear","color":1},
          {"kwhd":biomass_requirement/3650,"name":"Biomass","color":1}
        ]
      },
      {"name":"Demand","height":total_demand_inc_aviation_kwhd + (total_losses/3650),"saving":0,
        "stack":[
          {"kwhd":total_demand_inc_aviation_kwhd,"name":"Demand","color":0},
          {"kwhd":total_losses/3650,"name":"Losses","color":2}
        ]
      },
      {"name":"Demand","height":total_demand_inc_aviation_kwhd + (total_losses/3650),"saving":0,
        "stack":[
          {"kwhd":total_trad_elec_demand/3650,"name":"LAC","color":0},
          {"kwhd":(total_heatpump_demand+total_DHW_heatpump_elec_demand)/3650,"name":"Heatpumps","color":0},
          {"kwhd":total_EV_demand/3650,"name":"Electric Cars","color":0},
          {"kwhd":total_aviation_demand/3650,"name":"Aviation","color":0},
          {"kwhd":total_electrolysis_losses/3650,"name":"H2 losses","color":2},
          {"kwhd":total_CCGT_losses/3650,"name":"CCGT losses","color":2},
          {"kwhd":total_FT_losses/3650,"name":"FT losses","color":2},
          {"kwhd":total_sabatier_losses/3650,"name":"Sabatier losses","color":2}
        ]
      }
    ];
    draw_stacks(stacks,"stacks",1000,600,"kWh/d")
    
    $("#auto_scale_supply").click(function(){
        var total_demand = total_demand_inc_aviation_kwhd + (total_losses/3650);
        var scale = total_demand / total_supply_inc_biomass_kwhd
        
        onshorewind_capacity *= scale
        offshorewind_capacity *= scale
        solarpv_capacity *= scale
        hydro_capacity *= scale
        wave_capacity *= scale
        tidal_capacity *= scale
        nuclear_capacity *= scale
    });
    
}
// ---------------------------------------------------------------------------    
	
function national_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    
    if (view_mode=="supplydemand")
    {
        $.plot("#placeholder", [

            // tradelec + heatpump + ev
            {label: "EV charging demand", data:dataout[3], yaxis:1, color:"#aac15b", lines: {lineWidth:0, fill: 1.0 }}, 
            // tradelec + heatpump
            {label: "Heatpump electric demand", data:dataout[2], yaxis:1, color:"#cc4400", lines: {lineWidth:0, fill: 1.0 }},
            // tradelec
            {label: "Traditional electric demand", data:dataout[1], yaxis:1, color:"#00aacc", lines: {lineWidth:0, fill: 1.0 }}, 
            // EV SOC
            {label: "EV SOC", data:dataout[4], yaxis:2, color:"#cc0000", lines: {lineWidth:1, fill: false }},
            // supply
            {label: "Renewable Supply", data:dataout[0], yaxis:1, color:"#000000", lines: {lineWidth:1, fill: false }},

            ], {
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                yaxes: [{},{min: 0, max: 100}],
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
    }
}
