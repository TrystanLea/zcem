// - hour for day temperatures rolls over at 23:00 in spreadsheet model
// - no grid loss factor?
// - remove fix for hour+1 for temperatures
// - roll over average for heatstore
// - no roll over on +8h heatstore calc
// - balance_before_elec_store = balance_before_storage - EV_smart_charge, not change to BEV store??

function fullzcb_init()
{
    unitsmode = "GW"
    // ---------------------------------------------------------------------------
    // dataset index:
    // 0:onshore wind, 1:offshore wind, 2:wave, 3:tidal, 4:solar, 5:traditional electricity
    offshore_wind_capacity = 140.0
    onshore_wind_capacity = 20.0
    wave_capacity = 10.0
    tidal_capacity = 20.0
    hydro_capacity = 3.0
    solarpv_capacity = 70.0
    solarthermal_capacity = 30.0
    geothermal_elec_capacity = 3.0
    geothermal_heat_capacity = 2.0
    nuclear_capacity = 0.0
    grid_loss_prc = 0.0
    
    // Availability factors
    offshore_wind_availability = 0.9
    onshore_wind_availability = 0.9
    
    // Capacity factors
    // All other technologies based on hourly datasets
    hydro_cf = 0.3
    geothermal_elec_cf = 0.9
    geothermal_heat_cf = 0.9
    
    // Traditional electricity demand
    change_traditional_demand = 1.0 - 0.74823
    
    // Space & water heating demand
    specific_space_heat_demand = 4.398 // GW/K
    space_heat_base_temperature = 16.0-(385.0/119.0) // 12.8 K
    water_heating = 95.84*1000.0;         // GWh
    water_heating_daily_demand = water_heating / 365.25
    
    heatpump_COP = 3.0
    elres_efficiency = 1.0;
    biomass_efficiency = 0.9
    
    spacewater_share_heatpumps = 0.8
    spacewater_share_elres = 0.15
    spacewater_share_biomass = 0.05
    
    // Heatstore
    heatstore_enabled = true
    heatstore_storage_cap = 100.0
    heatstore_charge_cap = 50.0
    heatstore_SOC = heatstore_storage_cap * 0.5;
    
    // Industrial & cooking
    daily_cooking_elec = 26.94 * 1000.0 / 365.25
    daily_cooking_biogas = 0.0
    daily_cooking_biomass = 0.0
    
    daily_high_temp_process_elec = 12.80 * 1000.0 / 365.25
    daily_high_temp_process_biogas = 36.35 * 1000.0 / 365.25
    daily_high_temp_process_biomass = 0.0
    
    daily_low_temp_dry_sep_elec = 79.04 * 1000.0 / 365.25
    daily_low_temp_dry_sep_biogas = 13.17 * 1000.0 / 365.25
    daily_low_temp_dry_sep_biomass_CHP = 26.35 * 1000.0 / 365.25
    
    daily_non_heat_process_elec = 78.99 * 1000.0 / 365.25
    daily_non_heat_process_biogas = 11.54 * 1000.0 / 365.25
    daily_not_heat_process_biomass = 0.0
    
    industrial_biofuel = 11.54
    daily_industrial_biofuel = industrial_biofuel * 1000.0 / 365.25
    
    // Transport
    BEV_demand = 31.29
    electrains_demand = 10.8
    transport_H2_demand = 13.87
    transport_CH4_demand = 0.0
    transport_biofuels_demand = 59.13
    transport_kerosene_demand = 39.27
    transport_bioliquid_demand = transport_biofuels_demand + transport_kerosene_demand
    
    daily_BEV_demand = BEV_demand * 1000.0 / 365.25
    daily_elec_trains_demand = electrains_demand * 1000.0 / 365.25
    daily_transport_H2_demand = transport_H2_demand * 1000.0 / 365.25
    daily_transport_CH4_demand = transport_CH4_demand * 1000.0 / 365.25
    daily_transport_biofuels_demand = transport_biofuels_demand * 1000.0 / 365.25
    daily_transport_kerosene_demand = transport_kerosene_demand * 1000.0 / 365.25
    daily_transport_liquid_demand = transport_bioliquid_demand * 1000.0 / 365.25
    
    electric_car_battery_capacity = 294.75 // GWh
    electric_car_max_charge_rate = 42.11      // GW
    smart_charging_enabled = true 
    
    biomass_for_biofuel = 143.0
    biomass_for_biogas = 94.0
    daily_biomass_for_biofuel = biomass_for_biofuel * 1000.0 / 365.25
    daily_biomass_for_biogas = biomass_for_biogas * 1000.0 / 365.25
    
    FT_process_biomass_req = 1.3   // GWh/GWh fuel
    FT_process_hydrogen_req = 0.61 // GWh/GWh fuel
    
    // 
    electricity_storage_enabled = true
    elec_store_storage_cap = 50.0
    elec_store_charge_cap = 10.0
    
    // Hydrogen
    electrolysis_cap = 35.0
    electrolysis_eff = 0.7
    hydrogen_storage_cap = 20000.0
    minimum_hydrogen_store_level = 0.0
    
    // Methanation
    methanation_capacity = 5.0
    methanation_efficiency = 0.8
    methanation_raw_biogas_to_H2_ratio = 1.2
    methane_store_capacity = 70000.0
    
    anaerobic_digestion_efficiency = 0.5747
    methane_from_biogas = (daily_biomass_for_biogas / 24.0) * anaerobic_digestion_efficiency
    
    // Dispatchable
    dispatch_gen_cap = 45.0
    dispatchable_gen_eff = 0.50
    
    // Profiles
    cooking_profile = [0.00093739, 0.00093739, 0.00093739, 0.005002513, 0.015325386, 0.034557134, 0.075528659, 0.10242465, 0.112118681, 0.068802784, 0.046286663, 0.030023072, 0.019077393, 0.019077393, 0.021108649, 0.029555111, 0.069742295, 0.077562688, 0.071150746, 0.058327514, 0.044879681, 0.037216907, 0.032212599, 0.027207312];
    
    hot_water_profile = [0.00093739, 0.00093739, 0.00093739, 0.005002513, 0.015325386, 0.034557134, 0.075528659, 0.10242465, 0.112118681, 0.068802784, 0.046286663, 0.030023072, 0.019077393, 0.019077393, 0.021108649, 0.029555111, 0.069742295, 0.077562688, 0.071150746, 0.058327514, 0.044879681, 0.037216907, 0.032212599, 0.027207312];

    space_heat_profile = [0.008340899, 0.008340899, 0.008340899, 0.008340866, 0.016680908, 0.06511456, 0.076803719, 0.083470637, 0.0751301, 0.06009123, 0.04593692, 0.040060611, 0.0350685, 0.033362773, 0.033394683, 0.034247234, 0.036743141, 0.040881845, 0.05175043, 0.06264997, 0.064292437, 0.060849104, 0.04176657, 0.008341064];

    elec_trains_use_profile = [0.004268293, 0.002439024, 0.001829268, 0.001219512, 0.003658536, 0.009756097, 0.025609755, 0.061585364, 0.054878047, 0.048780486, 0.058536584, 0.066463413, 0.07317073, 0.065853657, 0.07317073, 0.082317071, 0.077439022, 0.079268291, 0.067073169, 0.051219511, 0.038414633, 0.02804878, 0.015853658, 0.009146341];
    
    high_temp_process_profile = [0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667];
    
    low_temp_process_profile = [0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667];
    
    not_heat_process_profile = [0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667, 0.041666667];
    
    BEV_use_profile = [0.004268293, 0.002439024, 0.001829268, 0.001219512, 0.003658536, 0.009756097, 0.025609755, 0.061585364, 0.054878047, 0.048780486, 0.058536584, 0.066463413, 0.07317073, 0.065853657, 0.07317073, 0.082317071, 0.077439022, 0.079268291, 0.067073169, 0.051219511, 0.038414633, 0.02804878, 0.015853658, 0.009146341];
    
    BEV_charge_profile = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.05, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.05, 0.05, 0.05, 0.05, 0.1];
    
    BEV_plugged_in_profile = [0.873684211, 0.889473684, 0.894736842, 0.9, 0.878947368, 0.826315789, 0.689473684, 0.378947368, 0.436842105, 0.489473684, 0.405263158, 0.336842105, 0.278947368, 0.342105263, 0.278947368, 0.2, 0.242105263, 0.226315789, 0.331578947, 0.468421053, 0.578947368, 0.668421053, 0.773684211, 0.831578947];

}

function fullzcb_run()
{
    heatstore_SOC = heatstore_storage_cap * 0.5
    BEV_Store_SOC = electric_car_battery_capacity * 0.5
    elecstore_SOC = elec_store_storage_cap * 1.0

    hydrogen_SOC_in = hydrogen_storage_cap * 0.5
    hydrogen_SOC_out = 0.0
    methane_SOC = methane_store_capacity * 0.5
    
    initial_elec_balance_positive = 0
    final_elec_balance_negative = 0
    final_elec_balance_positive = 0
    total_initial_elec_balance_positive = 0
    total_final_elec_balance_negative = 0
    total_final_elec_balance_positive = 0
    total_unmet_heat_demand = 0
    unmet_heat_demand_count = 0
    methane_store_empty_count = 0
    methane_store_full_count = 0
    hydrogen_store_empty_count = 0
    hydrogen_store_full_count = 0
    total_synth_fuel_produced = 0
    total_synth_fuel_biomass_used = 0
    total_methane_made = 0
    total_electricity_from_dispatchable = 0
    max_dispatchable_capacity = 0
    
    total_offshore_wind_supply = 0
    total_onshore_wind_supply = 0
    total_solar_supply = 0
    total_solarthermal = 0
    total_wave_supply = 0
    total_geothermal_heat = 0
    total_tidal_supply = 0
    total_geothermal_elec = 0
    total_nuclear_supply = 0
    total_hydro_supply = 0

    var check = [];
    
    data = {
        s1_total_variable_supply: [],
        s1_traditional_elec_demand: [],
        trad_plus_spacewater_elec: [],
        trad_heat_transport_elec: [],
        heatstore: [],
        heatstore_SOC: [],
        BEV_Store_SOC: [],
        elecstore_SOC: [],
        hydrogen_SOC: [],
        methane_SOC: []
        
    }
    
    // move to hourly model if needed
    heatpump_COP_hourly = heatpump_COP
    GWth_GWe = heatpump_COP_hourly * spacewater_share_heatpumps + elres_efficiency * spacewater_share_elres

    var capacityfactors_all = [];
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = tenyearsdatalines[hour].split(",");
        for (var i=0; i<capacityfactors.length; i++) {
            capacityfactors[i] = parseFloat(capacityfactors[i]);
        }
        capacityfactors_all.push(capacityfactors)
    }
    
    // --------------------------------------------------------------------------------------------------------------
    // Stage 1: First run calculates arrays used for second stage in +-12h storage models
    // --------------------------------------------------------------------------------------------------------------
    s1_spacewater_demand_before_heatstore = []
    s1_balance_before_heat_storage = []
    s1_industrial_elec_demand = []
    s1_methane_for_industry = []
        
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = capacityfactors_all[hour]
        
        // Fix: hour for day temperatures rolls over at 23:00 in spreadsheet model
        var day = parseInt(Math.floor((hour+1) / 24))
        var temperature = parseFloat(temperaturelines[day].split(",")[1]);
        if (day>3651) temperature = 0; // fix for hour+1 
        
        var time = datastarttime + (hour * 3600 * 1000);
        // --------------------------------------------------------------------------------------------------------------
        // Electricity part 1
        // --------------------------------------------------------------------------------------------------------------
        
        // 1. Variable supply
        offshore_wind_power_supply = offshore_wind_capacity * capacityfactors[1] * offshore_wind_availability
        onshore_wind_power_supply = onshore_wind_capacity * capacityfactors[0] * onshore_wind_availability
        wave_power_supply = wave_capacity * capacityfactors[2]
        tidal_power_supply = tidal_capacity * capacityfactors[3]
        pv_power_supply = solarpv_capacity * capacityfactors[4]
        geothermal_power_supply = geothermal_elec_capacity * geothermal_elec_cf
        hydro_power_supply = hydro_capacity * hydro_cf
        chp_power_supply = 0.0
        
        total_offshore_wind_supply += offshore_wind_power_supply
        total_onshore_wind_supply += onshore_wind_power_supply
        total_solar_supply += pv_power_supply
        total_wave_supply += wave_power_supply
        total_tidal_supply += tidal_power_supply
        total_geothermal_elec += geothermal_power_supply
        total_hydro_supply += hydro_power_supply
        
        total_variable_power_supply = offshore_wind_power_supply + onshore_wind_power_supply + wave_power_supply + tidal_power_supply + pv_power_supply + geothermal_power_supply + hydro_power_supply + chp_power_supply
        
        supply = total_variable_power_supply * (1.0-grid_loss_prc)
        data.s1_total_variable_supply.push([time,supply])
        
        // 2. Traditional electricity demand
        traditional_elec_demand = capacityfactors[5] * change_traditional_demand
        data.s1_traditional_elec_demand.push([time,traditional_elec_demand])
        // ---------------------------------------------------------------------------
        // Space & Water Heat part 1
        // ---------------------------------------------------------------------------
        degree_hours = space_heat_base_temperature - temperature
        if (degree_hours<0) degree_hours = 0
        
        solarthermal_supply = solarthermal_capacity * capacityfactors[4]
        geothermal_heat_supply = geothermal_heat_capacity * geothermal_heat_cf
        space_heat_demand = degree_hours * specific_space_heat_demand * 24.0 * space_heat_profile[hour%24]
        
        hot_water_demand = hot_water_profile[hour%24] * water_heating_daily_demand
        spacewater_demand_before_heatstore = space_heat_demand + hot_water_demand - geothermal_heat_supply - solarthermal_supply
        
        // Heatstore p1
        balance_before_heat_storage = supply - traditional_elec_demand - (spacewater_demand_before_heatstore/GWth_GWe)
        
        s1_spacewater_demand_before_heatstore.push(spacewater_demand_before_heatstore)
        s1_balance_before_heat_storage.push(balance_before_heat_storage)
        
        total_solarthermal += solarthermal_supply
        total_geothermal_heat += geothermal_heat_supply
        
        // ---------------------------------------------------------------------------
        // Industrial
        // ---------------------------------------------------------------------------
        
        cooking_elec = cooking_profile[hour%24] * daily_cooking_elec
        high_temp_process_elec = high_temp_process_profile[hour%24] * daily_high_temp_process_elec
        low_temp_process_elec = low_temp_process_profile[hour%24] * daily_low_temp_dry_sep_elec
        non_heat_process_elec = not_heat_process_profile[hour%24] * daily_non_heat_process_elec

        cooking_biogas = cooking_profile[hour%24] * daily_cooking_biogas
        high_temp_process_biogas = high_temp_process_profile[hour%24] * daily_high_temp_process_biogas
        low_temp_process_biogas = low_temp_process_profile[hour%24] * daily_low_temp_dry_sep_biogas
        non_heat_process_biogas = not_heat_process_profile[hour%24] * daily_non_heat_process_biogas
        s1_methane_for_industry.push(cooking_biogas+high_temp_process_biogas+low_temp_process_biogas+non_heat_process_biogas)
        
        cooking_biomass = cooking_profile[hour%24] * daily_cooking_biomass
        high_temp_process_biomass = high_temp_process_profile[hour%24] * daily_high_temp_process_biomass
        low_temp_process_biomass_CHP = low_temp_process_profile[hour%24] * daily_low_temp_dry_sep_biomass_CHP
        non_heat_process_biomass = not_heat_process_profile[hour%24] * daily_not_heat_process_biomass
        
        industrial_elec_demand = cooking_elec + high_temp_process_elec + low_temp_process_elec + non_heat_process_elec
        s1_industrial_elec_demand.push(industrial_elec_demand)        
    }
    loading_prc(40,"model stage 1");

    // --------------------------------------------------------------------------------------------------------------
    // Stage 2: Heatstore
    // --------------------------------------------------------------------------------------------------------------
    //  
    s2_deviation_from_mean_GWth = []
    for (var hour = 0; hour < hours; hour++) {
        var time = datastarttime + (hour * 3600 * 1000);
        
        var sum = 0; var n = 0;
        for (var i=-12; i<12; i++) {
            var index = hour + i
            if (index>=hours) index-=hours
            if (index>=0) {
                sum += s1_balance_before_heat_storage[index]
                n++;
            }
        }
        average_12h_balance_heat = sum / n;
        
        deviation_from_mean_GWe = s1_balance_before_heat_storage[hour] - average_12h_balance_heat
        deviation_from_mean_GWth = deviation_from_mean_GWe * GWth_GWe
        
        s2_deviation_from_mean_GWth.push(deviation_from_mean_GWth)
    }
    loading_prc(50,"model stage 2");
    
    s3_heatstore_SOC = []
    s3_balance_before_BEV_storage = []
    s3_spacewater_elec_demand = []
    for (var hour = 0; hour < hours; hour++) {
        var time = datastarttime + (hour * 3600 * 1000);
        
        var sum_pos = 0; var sum_neg = 0;
        for (var i=0; i<8; i++) {
            var index = hour + i
            // if (index>=hours) index-=hours (no rollover)
            if (index>=0 && index<hours) {
                if (s2_deviation_from_mean_GWth[index]>0) {
                    sum_pos += s2_deviation_from_mean_GWth[index]
                } else {
                    sum_neg += s2_deviation_from_mean_GWth[index]
                }
            }
        }
        
        heat_store_charge_GWth = 0
        if (s2_deviation_from_mean_GWth[hour]>0) {
            heat_store_charge_GWth = (heatstore_storage_cap-heatstore_SOC)*(s2_deviation_from_mean_GWth[hour]/sum_pos)
            if (heat_store_charge_GWth>heatstore_charge_cap) heat_store_charge_GWth = heatstore_charge_cap                                      // limit by charge capacity
        }

        heat_store_discharge_GWth = 0
        if (s2_deviation_from_mean_GWth[hour]<0) {
            spacewater_demand_before_heatstore = s1_spacewater_demand_before_heatstore[hour]
            if (spacewater_demand_before_heatstore<0) spacewater_demand_before_heatstore = 0
            
            heat_store_discharge_GWth = spacewater_demand_before_heatstore * (s2_deviation_from_mean_GWth[hour]/sum_neg)
            if (heat_store_discharge_GWth>spacewater_demand_before_heatstore) heat_store_discharge_GWth = spacewater_demand_before_heatstore    // limit discharge by demand
            if (heat_store_discharge_GWth>heatstore_charge_cap) heat_store_discharge_GWth = heatstore_charge_cap                                // limit by max discharge capacity
            if (heat_store_discharge_GWth>heatstore_SOC) heat_store_discharge_GWth = heatstore_SOC                                              // limit by available SOC        
        }
        
        heatstore_change = 0
        if (heatstore_enabled) {
            if (s1_spacewater_demand_before_heatstore[hour]>0) {
                heatstore_change = heat_store_charge_GWth - heat_store_discharge_GWth
            } else {
                heatstore_change = heatstore_storage_cap - heatstore_SOC
                if (-1*s1_spacewater_demand_before_heatstore[hour]<heatstore_change) heatstore_change = -1*s1_spacewater_demand_before_heatstore[hour]
            }
        }
        
        if (s1_spacewater_demand_before_heatstore[hour]>0) {
            heat_spill = 0
        } else {
            heat_spill = -1*s1_spacewater_demand_before_heatstore[hour] - heatstore_change
            if (heat_spill<0) heat_spill = 0
        }
        
        s3_heatstore_SOC.push(heatstore_SOC)
        data.heatstore_SOC.push([time,heatstore_SOC])
        heatstore_SOC += heatstore_change
                
        // space & water heat tab
        
        spacewater_demand_after_heatstore = s1_spacewater_demand_before_heatstore[hour] + heatstore_change
        if (spacewater_demand_after_heatstore<0) spacewater_demand_after_heatstore = 0
        
        heat_from_heatpumps = spacewater_demand_after_heatstore * spacewater_share_heatpumps
        heat_from_elres = spacewater_demand_after_heatstore * spacewater_share_elres
        heat_from_biomass = spacewater_demand_after_heatstore * spacewater_share_biomass
        ambient_heat_used = heat_from_heatpumps * (1.0-1.0/heatpump_COP)
        heatpump_elec_demand = heat_from_heatpumps / heatpump_COP
        elres_elec_demand = heat_from_elres / elres_efficiency
        
        unmet_heat_demand = spacewater_demand_after_heatstore - heat_from_heatpumps - heat_from_elres - heat_from_biomass
        if (unmet_heat_demand.toFixed(3)>0) {
            unmet_heat_demand_count++
            total_unmet_heat_demand += unmet_heat_demand
        }
        
        spacewater_elec_demand = heatpump_elec_demand + elres_elec_demand // electricity tab
        s3_spacewater_elec_demand.push(spacewater_elec_demand)
        
        data.trad_plus_spacewater_elec.push([time,data.s1_traditional_elec_demand[hour][1] + spacewater_elec_demand])
        
        //heatstore_charge = heatstore_change
        //if (heatstore_charge<0) heatstore_charge = 0
        //data.heatstore.push([time,data.s1_traditional_elec_demand[hour][1] + spacewater_elec_demand + heatstore_charge])
                
        // Balance calculation for BEV storage stage
        s3_balance_before_BEV_storage.push(data.s1_total_variable_supply[hour][1] - data.s1_traditional_elec_demand[hour][1] - spacewater_elec_demand)
    }
    loading_prc(60,"model stage 3");
    
    // -------------------------------------------------------------------------------------
    // Elec transport
    // -------------------------------------------------------------------------------------
    s4_BEV_Store_SOC = []
    s4_balance_before_elec_store = []
    for (var hour = 0; hour < hours; hour++)
    {
        var time = datastarttime + (hour * 3600 * 1000);
        
        elec_trains_demand = elec_trains_use_profile[hour%24] * daily_elec_trains_demand
        EV_discharge = BEV_use_profile[hour%24] * daily_BEV_demand
        EV_dumb_charge = BEV_charge_profile[hour%24] * daily_BEV_demand
        
        // +- 12 h average of balance before BEV Storage
        var sum = 0; var n = 0;
        for (var i=-12; i<12; i++) {
            var index = hour + i
            if (index>=hours) index-=hours
            if (index<0) index += hours
            sum += s3_balance_before_BEV_storage[index]
            n++;
        }
        average_12h_balance_before_BEV_storage = sum / n;
        // deviation from mean
        deviation_from_mean_BEV = s3_balance_before_BEV_storage[hour] - average_12h_balance_before_BEV_storage        
        
        EV_smart_charge = 0
        if (smart_charging_enabled) {
            if (deviation_from_mean_BEV>0) {
                EV_smart_charge = BEV_plugged_in_profile[hour%24] * electric_car_max_charge_rate                                                    // maximum charge rate
                EV_smart_charge2 = (electric_car_battery_capacity-BEV_Store_SOC)*deviation_from_mean_BEV/(electric_car_battery_capacity*0.5)        // limited by availability forecast
                if (EV_smart_charge>EV_smart_charge2) EV_smart_charge = EV_smart_charge2                                                            // 
                if (EV_smart_charge>(electric_car_battery_capacity-BEV_Store_SOC)) EV_smart_charge = electric_car_battery_capacity-BEV_Store_SOC    // LIMIT to max available SOC
                EV_smart_charge -= EV_dumb_charge
            } else {
                EV_smart_charge2 = BEV_Store_SOC*-deviation_from_mean_BEV/(electric_car_battery_capacity*0.5)
                if (EV_smart_charge2>EV_dumb_charge) EV_smart_charge2 = EV_dumb_charge
                EV_smart_charge = -EV_smart_charge2
            }
        }
        
        s4_BEV_Store_SOC.push(BEV_Store_SOC)
        data.BEV_Store_SOC.push([time,BEV_Store_SOC])
        
        change_to_BEV_store = -EV_discharge + EV_dumb_charge + EV_smart_charge
        BEV_Store_SOC += change_to_BEV_store
        if (BEV_Store_SOC>electric_car_battery_capacity) BEV_Store_SOC = electric_car_battery_capacity
        
        
        electricity_for_transport = elec_trains_demand + EV_dumb_charge
        
        // electricity summary tab
        balance_before_storage = data.s1_total_variable_supply[hour][1] - data.s1_traditional_elec_demand[hour][1] - s3_spacewater_elec_demand[hour] - s1_industrial_elec_demand[hour] - electricity_for_transport
        balance_before_elec_store = balance_before_storage - EV_smart_charge
        s4_balance_before_elec_store.push(balance_before_elec_store)
        
        //data.trad_heat_transport_elec.push([time,data.s1_traditional_elec_demand[hour][1]+s3_spacewater_elec_demand[hour]+electricity_for_transport])
    }
    loading_prc(70,"model stage 4");
    // -------------------------------------------------------------------------------------
    // Elec Store
    // -------------------------------------------------------------------------------------
    s5_elecstore_SOC = []
    s5_hydrogen_SOC = []
    s5_methane_SOC = []
    s5_final_balance = []
    for (var hour = 0; hour < hours; hour++)
    {
        var time = datastarttime + (hour * 3600 * 1000);
        
        // +- 12 h average of balance before BEV Storage
        var sum = 0; var n = 0;
        for (var i=-12; i<12; i++) {
            var index = hour + i
            if (index>=hours) index-=hours
            if (index<0) index += hours
            sum += s4_balance_before_elec_store[index]
            n++;
        }
        average_12h_balance_before_elec_storage = sum / n;
        deviation_from_mean_elec = s4_balance_before_elec_store[hour] - average_12h_balance_before_elec_storage
        
        elec_store_change = 0
        if (electricity_storage_enabled) {
            if (deviation_from_mean_elec>0) {
                elec_store_change = (elec_store_storage_cap-elecstore_SOC)*deviation_from_mean_elec/(elec_store_storage_cap*0.5)
                if (elec_store_change>(elec_store_storage_cap - elecstore_SOC)) elec_store_change = elec_store_storage_cap - elecstore_SOC   // Limit to available SOC
                if (elec_store_change>elec_store_charge_cap) elec_store_change = elec_store_charge_cap                                       // Limit to charge capacity
            } else {
                elec_store_change = elecstore_SOC*-deviation_from_mean_elec/(elec_store_storage_cap*0.5)
                if (elec_store_change>elecstore_SOC) elec_store_change = elecstore_SOC                      // Limit to elecstore SOC
                if (elec_store_change>elec_store_charge_cap) elec_store_change = elec_store_charge_cap      // Limit to discharge capacity
                elec_store_change *= -1                                                                     // invert
            }
        }
        
        s5_elecstore_SOC.push(elecstore_SOC)
        data.elecstore_SOC.push([time,elecstore_SOC])
        
        elecstore_SOC += elec_store_change
        if (elecstore_SOC<0) elecstore_SOC = 0                                                              // limits here can loose energy in the calc
        if (elecstore_SOC>elec_store_storage_cap) elecstore_SOC = elec_store_storage_cap                    // limits here can loose energy in the calc
        
        // ----------------------------------------------------------------------------
        // Hydrogen
        // ----------------------------------------------------------------------------
        balance_after_storage = s4_balance_before_elec_store[hour] - elec_store_change
        
        electricity_for_electrolysis = 0
        if (balance_after_storage>0) {
            electricity_for_electrolysis = balance_after_storage
            if (electricity_for_electrolysis>electrolysis_cap) electricity_for_electrolysis = electrolysis_cap
            if (electricity_for_electrolysis>((hydrogen_storage_cap-hydrogen_SOC_in)/electrolysis_eff)) electricity_for_electrolysis = (hydrogen_storage_cap-hydrogen_SOC_in)/electrolysis_eff
        }
        
        hydrogen_from_electrolysis = electricity_for_electrolysis * electrolysis_eff
        
        hydrogen_for_hydrogen_vehicles = daily_transport_H2_demand / 24.0
        if (hydrogen_for_hydrogen_vehicles>(hydrogen_SOC_in+hydrogen_from_electrolysis)) hydrogen_for_hydrogen_vehicles = hydrogen_SOC_in+hydrogen_from_electrolysis
        
        hydrogen_to_synth_fuel = ((daily_biomass_for_biofuel/24.0)/FT_process_biomass_req)*FT_process_hydrogen_req
        
        hydrogen_to_methanation = hydrogen_SOC_in+hydrogen_from_electrolysis-hydrogen_for_hydrogen_vehicles
        if (hydrogen_to_synth_fuel>hydrogen_to_methanation) hydrogen_to_synth_fuel=hydrogen_to_methanation
        
        hydrogen_to_methanation = methane_from_biogas/methanation_raw_biogas_to_H2_ratio
        available_hydrogen = hydrogen_SOC_in-(hydrogen_storage_cap*minimum_hydrogen_store_level)+hydrogen_from_electrolysis-hydrogen_for_hydrogen_vehicles-hydrogen_to_synth_fuel
        if (hydrogen_to_methanation>available_hydrogen) hydrogen_to_methanation = available_hydrogen
        if (hydrogen_to_methanation>methanation_capacity) hydrogen_to_methanation = methanation_capacity
        if (hydrogen_to_methanation<0) hydrogen_to_methanation = 0
        
        hydrogen_SOC_out = hydrogen_SOC_in + hydrogen_from_electrolysis - hydrogen_for_hydrogen_vehicles - hydrogen_to_synth_fuel - hydrogen_to_methanation
                
        s5_hydrogen_SOC.push(hydrogen_SOC_in)
        data.hydrogen_SOC.push([time,hydrogen_SOC_in])
        if ((hydrogen_SOC_in/hydrogen_storage_cap)<0.01) hydrogen_store_empty_count ++
        if ((hydrogen_SOC_in/hydrogen_storage_cap)>0.99) hydrogen_store_full_count ++
        
        hydrogen_SOC_in  = hydrogen_SOC_out
        if (hydrogen_SOC_in>hydrogen_storage_cap) hydrogen_SOC_in = hydrogen_storage_cap
        
        // ----------------------------------------------------------------------------
        // Dispatchable
        // ---------------------------------------------------------------------------- 
        electricity_from_dispatchable = 0       
        if (balance_after_storage<0) electricity_from_dispatchable = -balance_after_storage
        if (electricity_from_dispatchable>dispatch_gen_cap) electricity_from_dispatchable = dispatch_gen_cap
        if (electricity_from_dispatchable>(methane_SOC*dispatchable_gen_eff)) electricity_from_dispatchable = methane_SOC*dispatchable_gen_eff
        
        balance_after_electrolysis_and_dispatchable = balance_after_storage - electricity_for_electrolysis + electricity_from_dispatchable
        s5_final_balance.push(balance_after_electrolysis_and_dispatchable)
        total_electricity_from_dispatchable += electricity_from_dispatchable
        if (electricity_from_dispatchable>max_dispatchable_capacity) max_dispatchable_capacity = electricity_from_dispatchable
        // ----------------------------------------------------------------------------
        // Methane
        // ----------------------------------------------------------------------------
        methane_from_hydrogen = hydrogen_to_methanation * methanation_efficiency
        // methane_from_biogas: calculated at start
        total_methane_made += methane_from_hydrogen + methane_from_biogas
        methane_to_dispatchable = electricity_from_dispatchable / dispatchable_gen_eff
        methane_for_spacewater_heat = 0
        // s1_methane_for_industry: calculated in stage 1
        // s1_methane_for_industryCHP
        methane_for_industryCHP = 0 // add this in!!
        methane_balance = methane_from_hydrogen + methane_from_biogas - methane_to_dispatchable - methane_for_spacewater_heat - s1_methane_for_industry[hour] - methane_for_industryCHP
        
        s5_methane_SOC.push(methane_SOC)
        data.methane_SOC.push([time,methane_SOC])
        if ((methane_SOC/methane_store_capacity)<0.01) methane_store_empty_count ++
        if ((methane_SOC/methane_store_capacity)>0.99) methane_store_full_count ++
        
        methane_SOC += methane_balance
        if (methane_SOC>methane_store_capacity) methane_SOC = methane_store_capacity
        
        if (balance_after_storage>0) {
            total_initial_elec_balance_positive += balance_after_storage
            initial_elec_balance_positive++
        }
        if (balance_after_electrolysis_and_dispatchable<0) {
            total_final_elec_balance_negative += balance_after_electrolysis_and_dispatchable
            final_elec_balance_negative++
        }
        if (balance_after_electrolysis_and_dispatchable>0) {
            total_final_elec_balance_positive += balance_after_electrolysis_and_dispatchable
            final_elec_balance_positive++
        }
        
        // ------------------------------------------------------------------------------------
        // Synth fuel
        synth_fuel_produced = hydrogen_to_synth_fuel / FT_process_hydrogen_req
        synth_fuel_biomass_used = synth_fuel_produced * FT_process_biomass_req
        
        total_synth_fuel_produced += synth_fuel_produced
        total_synth_fuel_biomass_used += synth_fuel_biomass_used
    }
    loading_prc(80,"model stage 5");
    
    total_initial_elec_balance_positive = total_initial_elec_balance_positive / 10000.0
    total_final_elec_balance_negative = -1 * total_final_elec_balance_negative / 10000.0
    total_final_elec_balance_positive = total_final_elec_balance_positive / 10000.0
    total_unmet_heat_demand = total_unmet_heat_demand.toFixed(3);
    total_synth_fuel_produced = total_synth_fuel_produced / 10000.0
    total_synth_fuel_biomass_used = total_synth_fuel_biomass_used / 10000.0
    total_methane_made = total_methane_made / 10000.0
    total_electricity_from_dispatchable /= 10000.0
    
    liquid_fuel_produced_prc_diff = 100 * (total_synth_fuel_produced - (transport_bioliquid_demand+industrial_biofuel)) / (transport_bioliquid_demand+industrial_biofuel)

    initial_elec_balance_positive_prc = 100*initial_elec_balance_positive / hours
    final_elec_balance_negative_prc = 100*final_elec_balance_negative / hours
    final_elec_balance_positive_prc = 100*final_elec_balance_positive / hours
    unmet_heat_demand_prc = 100*unmet_heat_demand_count / hours
    methane_store_empty_prc = 100*methane_store_empty_count / hours
    methane_store_full_prc = 100*methane_store_full_count / hours
    hydrogen_store_empty_prc = 100*hydrogen_store_empty_count / hours
    hydrogen_store_full_prc = 100*hydrogen_store_full_count / hours
        
    
    
    // ----------------------------------------------------------------------------
    // Tests
    // ----------------------------------------------------------------------------
    // 1. Test definition
    var tests = {
      "s3_heatstore_SOC": {testdataindex:1},
      "s4_BEV_Store_SOC": {testdataindex:2},
      "s5_elecstore_SOC": {testdataindex:3},
      "s5_hydrogen_SOC": {testdataindex:4},
      "s5_methane_SOC": {testdataindex:5},
      "s5_final_balance": {testdataindex:6}
    }
    // 2. Test init
    for (var z in tests) {
        tests[z].max_error = 0.0
        tests[z].sum_error = 0.0
        tests[z].sum = 0.0
    }
    // 3. Error calculation
    for (var hour = 0; hour < hours; hour++) {
        var test = testlines[hour].split(",");
        
        for (var z in tests) {
            var testval = parseFloat(test[tests[z].testdataindex]);
            error = Math.abs(window[z][hour] - testval);
            if (error>tests[z].max_error) tests[z].max_error = error;
            tests[z].sum_error += error
        }
    }
    // 4. Test output
    var out = "";
    for (var z in tests) {
    if (tests[z].sum_error/hours<0.1) status = "success"; else status = "error";
        out += "<div class='alert alert-"+status+"'><b>"+status+":</b> "+z+" (mean:"+(tests[z].sum_error/hours).toFixed(4)+", max:"+tests[z].max_error.toFixed(2)+")</div>";
    }
    
    $("#tests").html(out);
    loading_prc(90,"tests");
    
    // Output
    var out = "";
    for (var hour = 0; hour < hours; hour++) {
        var test = testlines[hour].split(",");
        var heatstore_SOC = parseFloat(test[1]);
        var BEV_Store_SOC = parseFloat(test[2]);
        var hydrogen_SOC = parseFloat(test[4]);
        var methane_SOC = parseFloat(test[5]);
        var final_balance = parseFloat(test[6]);
        
        error = Math.abs(final_balance-s5_final_balance[hour])
        
        if (error>1) {
            //out += (hour+2)+"\t"+final_balance.toFixed(1)+"\t"+s5_final_balance[hour].toFixed(1)+"\t"+error+"\n";
        }
        
    } 
        
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
            } else if (unitsmode=="GW") {
                scale = (1.0 / 10)*0.001
                units = " TWh"
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
}
// ---------------------------------------------------------------------------    
	
function fullzcb_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    if (view_mode=="")
    {
        $.plot("#placeholder", [
            // {label: "Electrolysis", data:dataout.EH2, yaxis:1, color:"#00aacc", lines: {lineWidth:0, fill: 1.0 }},
            //{label: "EV", data:dataout.trad_heat_transport_elec, yaxis:1, color:"#aac15b", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Heatstore", data:dataout.heatstore, yaxis:1, color:"#cc3311", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Electric Heat", data:dataout.trad_plus_spacewater_elec, yaxis:1, color:"#cc6622", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Traditional", data:dataout.s1_traditional_elec_demand, yaxis:1, color:"#0066cc", lines: {lineWidth:0, fill: 1.0 }},
            {label: "Supply", data:dataout.s1_total_variable_supply, yaxis:1, color:"#000000", lines: {lineWidth:0.2, fill: false }},

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
                {label: "Methane Store", data:dataout.methane_SOC, yaxis:3, color:"#ccaa00", lines: {lineWidth:0, fill: 0.8 }},
                {label: "Hydrogen Store", data:dataout.hydrogen_SOC, yaxis:3, color:"#97b5e7", lines: {lineWidth:0, fill: 1.0 }},
                {label: "BEV Store", data:dataout.BEV_Store_SOC, yaxis:3, color:"#aac15b", lines: {lineWidth:0, fill: 0.8 }},
                {label: "Heat Store", data:dataout.heatstore_SOC, yaxis:3, color:"#cc3311", lines: {lineWidth:0, fill: 0.8 }},
                {label: "Battery Store", data:dataout.elecstore_SOC, yaxis:3, color:"#1960d5", lines: {lineWidth:0, fill: 0.8 }}
            ], {
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                yaxes: [{},{min: 0},{}],
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
    }
}
