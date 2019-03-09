// - no grid loss factor?
// - balance_before_elec_store = balance_before_storage - EV_smart_charge, not change to BEV store??
// - are we accounting for electric requirement for heatstore??
// - methane losses from store capping
// - review CHP 
// - potential for unmet hydrogen vehicle demand
// - search MFIX to find notes

function fullzcb2_init()
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
    nuclear_availability = 0.9
    
    // Capacity factors
    // All other technologies based on hourly datasets
    hydro_cf = 0.3
    geothermal_elec_cf = 0.9
    geothermal_heat_cf = 0.9
    
    // Traditional electricity demand
    prc_reduction_traditional_demand = 100*0.74823
    
    // Space & water heating demand
    specific_space_heat_demand = 4.398                // GW/K
    space_heat_base_temperature = 16.0-(385.0/119.0)  // 12.8 K
    water_heating = 95.84;                            // GWh
    
    // Heating system efficiencies
    heatpump_COP = 3.0
    elres_efficiency = 1.0
    biomass_efficiency = 0.9
    methane_boiler_efficiency = 0.9
    
    // Heating system share of demand
    spacewater_share_heatpumps = 0.8
    spacewater_share_elres = 0.15
    spacewater_share_biomass = 0.05
    spacewater_share_methane = 0.00
    
    // Heatstore
    heatstore_enabled = 1
    heatstore_storage_cap = 100.0
    heatstore_charge_cap = 50.0
    
    // Industrial & cooking
    annual_cooking_elec = 26.94
    annual_cooking_biogas = 0.0
    annual_cooking_biomass = 0.0
    annual_cooking_biogas_CHP = 0.0
    annual_cooking_biomass_CHP = 0.0
                
    annual_high_temp_process_elec = 12.80
    annual_high_temp_process_biogas = 36.35
    annual_high_temp_process_biomass = 0.0
    annual_high_temp_process_biogas_CHP = 0.0
    annual_high_temp_process_biomass_CHP = 0.0
        
    annual_low_temp_dry_sep_elec = 79.04
    annual_low_temp_dry_sep_biogas = 13.17
    annual_low_temp_dry_sep_biomass = 0.0
    annual_low_temp_dry_sep_biogas_CHP = 0.0
    annual_low_temp_dry_sep_biomass_CHP = 26.35
            
    annual_non_heat_process_elec = 78.99
    annual_non_heat_process_biogas = 11.54
    annual_non_heat_process_biomass = 0.0
    annual_non_heat_process_biogas_CHP = 0.0
    annual_non_heat_process_biomass_CHP = 0.0
    
    industrial_biofuel = 11.54
    
    // Transport
    BEV_demand = 31.29
    electrains_demand = 10.8
    transport_H2_demand = 13.87
    transport_CH4_demand = 0.0
    transport_biofuels_demand = 59.13
    transport_kerosene_demand = 39.27
    
    electric_car_battery_capacity = 294.75    // GWh
    electric_car_max_charge_rate = 42.11      // GW
    smart_charging_enabled = 1
    
    biomass_for_biofuel = (transport_biofuels_demand + transport_kerosene_demand + industrial_biofuel)*1.3 // 143.0
    biomass_for_biogas = 94.0
    
    FT_process_biomass_req = 1.3   // GWh/GWh fuel
    FT_process_hydrogen_req = 0.61 // GWh/GWh fuel
    
    // 
    electricity_storage_enabled = 1
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

function fullzcb2_run()
{
    // Store SOC's
    heatstore_SOC_start = heatstore_storage_cap * 0.5
    BEV_Store_SOC_start = electric_car_battery_capacity * 0.5
    elecstore_SOC_start = elec_store_storage_cap * 1.0
    hydrogen_SOC_start = hydrogen_storage_cap * 0.5
    methane_SOC_start = methane_store_capacity * 0.5
    
    heatstore_SOC = heatstore_SOC_start
    BEV_Store_SOC = BEV_Store_SOC_start
    elecstore_SOC = elecstore_SOC_start
    hydrogen_SOC = hydrogen_SOC_start
    methane_SOC = methane_SOC_start
    
    total_EV_charge = 0
    total_elec_trains_demand = 0
    
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
    
    total_biomass_used = 0
    total_supply = 0
    total_ambient_heat_supply = 0
    
    total_biomass_for_spacewaterheat_loss = 0
    total_methane_for_spacewaterheat_loss = 0
    
    // demand totals
    total_traditional_elec = 0
    total_space_heat_demand = 0
    
    total_industrial_elec_demand = 0
    total_industrial_methane_demand = 0
    total_industrial_biomass_demand = 0
    
    total_hydrogen_for_hydrogen_vehicles = 0
    unmet_hydrogen_demand = 0
    
    total_grid_losses = 0
    total_electrolysis_losses = 0
    total_CCGT_losses = 0
    total_sabatier_losses = 0
    total_anaerobic_digestion_losses = 0
    total_FT_losses = 0
    
    total_synth_fuel_demand = 0
    
    methane_store_vented = 0
    total_heat_spill = 0
    
    change_traditional_demand = 1.0 - (prc_reduction_traditional_demand/100)

    transport_bioliquid_demand = transport_biofuels_demand + transport_kerosene_demand

    water_heating_daily_demand = water_heating * 1000.0 / 365.25    
    
    daily_BEV_demand = BEV_demand * 1000.0 / 365.25
    daily_elec_trains_demand = electrains_demand * 1000.0 / 365.25
    daily_transport_H2_demand = transport_H2_demand * 1000.0 / 365.25
    daily_transport_CH4_demand = transport_CH4_demand * 1000.0 / 365.25
    daily_transport_biofuels_demand = transport_biofuels_demand * 1000.0 / 365.25
    daily_transport_kerosene_demand = transport_kerosene_demand * 1000.0 / 365.25
    daily_transport_liquid_demand = transport_bioliquid_demand * 1000.0 / 365.25

    daily_cooking_elec = annual_cooking_elec * 1000.0 / 365.25
    daily_cooking_biogas = annual_cooking_biogas * 1000.0 / 365.25
    daily_cooking_biomass = annual_cooking_biogas * 1000.0 / 365.25
    daily_cooking_biogas_CHP = annual_cooking_biogas_CHP * 1000.0 / 365.25
    daily_cooking_biomass_CHP = annual_cooking_biogas_CHP * 1000.0 / 365.25
        
    daily_high_temp_process_elec = annual_high_temp_process_elec * 1000.0 / 365.25
    daily_high_temp_process_biogas = annual_high_temp_process_biogas * 1000.0 / 365.25
    daily_high_temp_process_biomass = annual_high_temp_process_biomass * 1000.0 / 365.25
    daily_high_temp_process_biogas_CHP = annual_high_temp_process_biogas_CHP * 1000.0 / 365.25
    daily_high_temp_process_biomass_CHP = annual_high_temp_process_biomass_CHP * 1000.0 / 365.25

    daily_low_temp_dry_sep_elec = annual_low_temp_dry_sep_elec * 1000.0 / 365.25
    daily_low_temp_dry_sep_biogas = annual_low_temp_dry_sep_biogas * 1000.0 / 365.25
    daily_low_temp_dry_sep_biomass = annual_low_temp_dry_sep_biomass * 1000.0 / 365.25
    daily_low_temp_dry_sep_biogas_CHP = annual_low_temp_dry_sep_biogas_CHP * 1000.0 / 365.25
    daily_low_temp_dry_sep_biomass_CHP = annual_low_temp_dry_sep_biomass_CHP * 1000.0 / 365.25
          
    daily_non_heat_process_elec = annual_non_heat_process_elec * 1000.0 / 365.25
    daily_non_heat_process_biogas = annual_non_heat_process_biogas * 1000.0 / 365.25
    daily_non_heat_process_biomass = annual_non_heat_process_biomass * 1000.0 / 365.25
    daily_non_heat_process_biogas_CHP = annual_non_heat_process_biogas_CHP * 1000.0 / 365.25
    daily_non_heat_process_biomass_CHP = annual_non_heat_process_biomass_CHP * 1000.0 / 365.25
        
    daily_industrial_biofuel = industrial_biofuel * 1000.0 / 365.25
    daily_biomass_for_biofuel = biomass_for_biofuel * 1000.0 / 365.25
    daily_biomass_for_biogas = biomass_for_biogas * 1000.0 / 365.25
    hourly_biomass_for_biogas = daily_biomass_for_biogas / 24.0

    methane_from_biogas = hourly_biomass_for_biogas * anaerobic_digestion_efficiency

    var check = [];
    
    data = {
        s1_total_variable_supply: [],
        s1_traditional_elec_demand: [],
        industry_elec: [],
        spacewater_elec: [],
        trad_heat_transport_elec: [],
        heatstore: [],
        heatstore_SOC: [],
        BEV_Store_SOC: [],
        elecstore_SOC: [],
        hydrogen_SOC: [],
        methane_SOC: [],
        electricity_from_dispatchable: [],
        elec_store_charge: [],
        elec_store_discharge: [],
        EV_smart_discharge: [],
        EV_charge: [],
        EL_transport: [],
        electricity_for_electrolysis: [],
        export_elec:[],
        unmet_elec:[]
    }
    
    // move to hourly model if needed
    heatpump_COP_hourly = heatpump_COP
    GWth_GWe = (heatpump_COP_hourly * spacewater_share_heatpumps) + (elres_efficiency * spacewater_share_elres) + (methane_boiler_efficiency * spacewater_share_methane)

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
    
    for (var hour = 0; hour < hours; hour++) {
        var capacityfactors = capacityfactors_all[hour]
        var day = parseInt(Math.floor(hour / 24))
        var temperature = parseFloat(temperaturelines[day].split(",")[1]);
        
        var time = datastarttime + (hour * 3600 * 1000);
        // --------------------------------------------------------------------------------------------------------------
        // Electricity Supply
        // --------------------------------------------------------------------------------------------------------------
        // variable supply
        offshore_wind_power_supply = offshore_wind_capacity * capacityfactors[1] * offshore_wind_availability
        onshore_wind_power_supply = onshore_wind_capacity * capacityfactors[0] * onshore_wind_availability
        wave_power_supply = wave_capacity * capacityfactors[2]
        tidal_power_supply = tidal_capacity * capacityfactors[3]
        pv_power_supply = solarpv_capacity * capacityfactors[4]
        geothermal_power_supply = geothermal_elec_capacity * geothermal_elec_cf
        hydro_power_supply = hydro_capacity * hydro_cf

        // non-variable non-backup electricity supply
        nuclear_power_supply = nuclear_capacity * nuclear_availability
        chp_power_supply = 0.0

        // totals        
        total_offshore_wind_supply += offshore_wind_power_supply
        total_onshore_wind_supply += onshore_wind_power_supply
        total_solar_supply += pv_power_supply
        total_wave_supply += wave_power_supply
        total_tidal_supply += tidal_power_supply
        total_geothermal_elec += geothermal_power_supply
        total_hydro_supply += hydro_power_supply
        total_nuclear_supply += nuclear_power_supply
        
        // total supply
        electricity_supply = offshore_wind_power_supply + onshore_wind_power_supply + wave_power_supply + tidal_power_supply + pv_power_supply + geothermal_power_supply + hydro_power_supply + chp_power_supply + nuclear_power_supply
        total_supply += electricity_supply
        
        // supply after losses
        supply = electricity_supply * (1.0-grid_loss_prc)
        data.s1_total_variable_supply.push([time,supply])
        // total losses
        total_grid_losses += electricity_supply - supply

        // ---------------------------------------------------------------------------
        // Traditional electricity demand
        // ---------------------------------------------------------------------------
        traditional_elec_demand = capacityfactors[5] * change_traditional_demand
        data.s1_traditional_elec_demand.push([time,traditional_elec_demand])
        total_traditional_elec += traditional_elec_demand
        // ---------------------------------------------------------------------------
        // Space & Water Heat part 1
        // ---------------------------------------------------------------------------
        // space heat
        degree_hours = space_heat_base_temperature - temperature
        if (degree_hours<0) degree_hours = 0
        space_heat_demand = degree_hours * specific_space_heat_demand * 24.0 * space_heat_profile[hour%24]
        total_space_heat_demand += space_heat_demand
        
        // water heat
        hot_water_demand = hot_water_profile[hour%24] * water_heating_daily_demand
        total_space_heat_demand += hot_water_demand       
        
        // solar thermal
        solarthermal_supply = solarthermal_capacity * capacityfactors[4]
        total_solarthermal += solarthermal_supply
        
        // geothermal
        geothermal_heat_supply = geothermal_heat_capacity * geothermal_heat_cf
        total_geothermal_heat += geothermal_heat_supply
        
        spacewater_demand_before_heatstore = space_heat_demand + hot_water_demand - geothermal_heat_supply - solarthermal_supply
        
        // Heatstore p1
        balance_before_heat_storage = supply - traditional_elec_demand - (spacewater_demand_before_heatstore/GWth_GWe)
        
        s1_spacewater_demand_before_heatstore.push(spacewater_demand_before_heatstore)
        s1_balance_before_heat_storage.push(balance_before_heat_storage)
    }
    loading_prc(40,"model stage 1");

    // --------------------------------------------------------------------------------------------------------------
    // Stage 2: Heatstore
    // --------------------------------------------------------------------------------------------------------------
    s2_deviation_from_mean_GWth = []
    for (var hour = 0; hour < hours; hour++) {
        var time = datastarttime + (hour * 3600 * 1000);
        
        var sum = 0; var n = 0;
        for (var i=-12; i<12; i++) {
            var index = hour + i
            if (index>=hours) index-=hours
            if (index<0) index += hours
            sum += s1_balance_before_heat_storage[index]
            n++;
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
    s3_biomass_for_spacewaterheat = []
    s3_methane_for_spacewaterheat = []
    
    for (var hour = 0; hour < hours; hour++) {
        var time = datastarttime + (hour * 3600 * 1000);
        
        var sum_pos = 0; var sum_neg = 0;
        for (var i=0; i<8; i++) {
            var index = hour + i
            if (index>=hours) index-=hours
            if (s2_deviation_from_mean_GWth[index]>0) {
                sum_pos += s2_deviation_from_mean_GWth[index]
            } else {
                sum_neg += s2_deviation_from_mean_GWth[index]
            }
        }
        
        // If the balance from the previous section is negative
        // we have surplus heat supply e.g solar thermal, geothermal etc.
        spacewater_demand = 0.0
        spacewater_surplus = 0.0
        spacewater_balance = s1_spacewater_demand_before_heatstore[hour]
        if (spacewater_balance>=0.0) {
            spacewater_demand = spacewater_balance 
        } else {
            spacewater_surplus = -spacewater_balance
        }
        
        heat_store_charge_GWth = 0.0
        heat_store_discharge_GWth = 0.0
        
        if (s2_deviation_from_mean_GWth[hour]>=0.0) {
            heat_store_charge_GWth = (heatstore_storage_cap-heatstore_SOC)*(s2_deviation_from_mean_GWth[hour]/sum_pos)
            if (heat_store_charge_GWth>heatstore_charge_cap) heat_store_charge_GWth = heatstore_charge_cap                                      // limit by charge capacity
        } else {
            heat_store_discharge_GWth = spacewater_demand * (s2_deviation_from_mean_GWth[hour]/sum_neg)
            if (heat_store_discharge_GWth>spacewater_demand) heat_store_discharge_GWth = spacewater_demand                                      // limit discharge by demand
            if (heat_store_discharge_GWth>heatstore_charge_cap) heat_store_discharge_GWth = heatstore_charge_cap                                // limit by max discharge capacity
            if (heat_store_discharge_GWth>heatstore_SOC) heat_store_discharge_GWth = heatstore_SOC                                              // limit by available SOC        
        }
        
        heat_spill = 0.0
        heatstore_change = 0.0
        if (heatstore_enabled) {
            if (spacewater_balance>=0.0) {
                heatstore_change = heat_store_charge_GWth - heat_store_discharge_GWth
            } else {
                // This overwrites potential heat charging from the section above, needs looking at
                heatstore_change = spacewater_surplus                                                                                           // Charge heat store with surplus
                if ((heatstore_SOC+heatstore_change)>heatstore_storage_cap) heatstore_change = heatstore_storage_cap - heatstore_SOC            // Limit to available store
                heat_spill = spacewater_surplus - heatstore_change
            }
        }
        
        s3_heatstore_SOC.push(heatstore_SOC)
        data.heatstore_SOC.push([time,heatstore_SOC])
        heatstore_SOC += heatstore_change
        total_heat_spill += heat_spill
                
        // space & water heat tab
        spacewater_demand_after_heatstore = spacewater_balance + heatstore_change
        if (spacewater_demand_after_heatstore<0.0) spacewater_demand_after_heatstore = 0.0
        
        // electric resistance
        heat_from_elres = spacewater_demand_after_heatstore * spacewater_share_elres
        elres_elec_demand = heat_from_elres / elres_efficiency
        
        // heatpumps
        heat_from_heatpumps = spacewater_demand_after_heatstore * spacewater_share_heatpumps
        heatpump_elec_demand = heat_from_heatpumps / heatpump_COP
        ambient_heat_used = heat_from_heatpumps * (1.0-1.0/heatpump_COP)
        total_ambient_heat_supply += ambient_heat_used
        
        // biomass heat
        heat_from_biomass = spacewater_demand_after_heatstore * spacewater_share_biomass
        biomass_for_spacewaterheat = heat_from_biomass / biomass_efficiency
        s3_biomass_for_spacewaterheat.push(biomass_for_spacewaterheat)
        total_biomass_for_spacewaterheat_loss += biomass_for_spacewaterheat - heat_from_biomass
        
        // methane/gas boiler heat
        heat_from_methane = spacewater_demand_after_heatstore * spacewater_share_methane
        methane_for_spacewaterheat = heat_from_methane / methane_boiler_efficiency
        s3_methane_for_spacewaterheat.push(methane_for_spacewaterheat)
        total_methane_for_spacewaterheat_loss += methane_for_spacewaterheat - heat_from_methane
        
        // check for unmet heat
        unmet_heat_demand = spacewater_demand_after_heatstore - heat_from_heatpumps - heat_from_elres - heat_from_biomass - heat_from_methane
        if (unmet_heat_demand.toFixed(3)>0) {
            unmet_heat_demand_count++
            total_unmet_heat_demand += unmet_heat_demand
        }
        
        spacewater_elec_demand = heatpump_elec_demand + elres_elec_demand // electricity tab
        s3_spacewater_elec_demand.push(spacewater_elec_demand)
        data.spacewater_elec.push([time,spacewater_elec_demand])
        
        // Balance calculation for BEV storage stage
        s3_balance_before_BEV_storage.push(data.s1_total_variable_supply[hour][1] - data.s1_traditional_elec_demand[hour][1] - spacewater_elec_demand)
    }
    loading_prc(60,"model stage 3");

    // ---------------------------------------------------------------------------
    // Industrial
    // ---------------------------------------------------------------------------
    s1_industrial_elec_demand = []
    s1_methane_for_industry = []
    s1_biomass_for_industry = []
    
    for (var hour = 0; hour < hours; hour++)
    {
        var time = datastarttime + (hour * 3600 * 1000);
        
        // electric demand
        cooking_elec = cooking_profile[hour%24] * daily_cooking_elec
        high_temp_process_elec = high_temp_process_profile[hour%24] * daily_high_temp_process_elec
        low_temp_process_elec = low_temp_process_profile[hour%24] * daily_low_temp_dry_sep_elec
        non_heat_process_elec = not_heat_process_profile[hour%24] * daily_non_heat_process_elec
        industrial_elec_demand = cooking_elec + high_temp_process_elec + low_temp_process_elec + non_heat_process_elec
        s1_industrial_elec_demand.push(industrial_elec_demand)
        total_industrial_elec_demand += industrial_elec_demand 
        data.industry_elec.push([time,industrial_elec_demand])
        
        // methane demand
        cooking_biogas = cooking_profile[hour%24] * daily_cooking_biogas
        high_temp_process_biogas = high_temp_process_profile[hour%24] * daily_high_temp_process_biogas
        low_temp_process_biogas = low_temp_process_profile[hour%24] * daily_low_temp_dry_sep_biogas
        non_heat_process_biogas = not_heat_process_profile[hour%24] * daily_non_heat_process_biogas
        industrial_methane_demand = cooking_biogas + high_temp_process_biogas + low_temp_process_biogas + non_heat_process_biogas
        
        cooking_biogas_CHP = cooking_profile[hour%24] * daily_cooking_biogas_CHP
        high_temp_process_biogas_CHP = high_temp_process_profile[hour%24] * daily_high_temp_process_biogas_CHP
        low_temp_process_biogas_CHP = low_temp_process_profile[hour%24] * daily_low_temp_dry_sep_biogas_CHP
        non_heat_process_biogas_CHP = not_heat_process_profile[hour%24] * daily_non_heat_process_biogas_CHP
        industrial_biogas_CHP_demand = cooking_biogas_CHP + high_temp_process_biogas_CHP + low_temp_process_biogas_CHP + non_heat_process_biogas_CHP        
        
        s1_methane_for_industry.push(industrial_methane_demand+industrial_biogas_CHP_demand)
        total_industrial_methane_demand += industrial_methane_demand+industrial_biogas_CHP_demand
        
        // biomass demand
        cooking_biomass = cooking_profile[hour%24] * daily_cooking_biomass
        high_temp_process_biomass = high_temp_process_profile[hour%24] * daily_high_temp_process_biomass
        low_temp_process_biomass = low_temp_process_profile[hour%24] * daily_low_temp_dry_sep_biomass
        non_heat_process_biomass = not_heat_process_profile[hour%24] * daily_non_heat_process_biomass
        industrial_biomass_demand = cooking_biomass + high_temp_process_biomass + low_temp_process_biomass + non_heat_process_biomass
                
        cooking_biomass_CHP = cooking_profile[hour%24] * daily_cooking_biomass_CHP
        high_temp_process_biomass_CHP = high_temp_process_profile[hour%24] * daily_high_temp_process_biomass_CHP
        low_temp_process_biomass_CHP = low_temp_process_profile[hour%24] * daily_low_temp_dry_sep_biomass_CHP
        non_heat_process_biomass_CHP = not_heat_process_profile[hour%24] * daily_non_heat_process_biomass_CHP
        industrial_biomass_CHP_demand = cooking_biomass_CHP + high_temp_process_biomass_CHP + low_temp_process_biomass_CHP + non_heat_process_biomass_CHP

        s1_biomass_for_industry.push(industrial_biomass_demand+industrial_biomass_CHP_demand)
        total_industrial_biomass_demand += industrial_biomass_demand + industrial_biomass_CHP_demand
    }
    
    // -------------------------------------------------------------------------------------
    // Elec transport
    // -------------------------------------------------------------------------------------
    s4_BEV_Store_SOC = []
    s4_balance_before_elec_store = []
    for (var hour = 0; hour < hours; hour++)
    {
        var time = datastarttime + (hour * 3600 * 1000);
        
        elec_trains_demand = elec_trains_use_profile[hour%24] * daily_elec_trains_demand
        total_elec_trains_demand += elec_trains_demand
        
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
        balance = s3_balance_before_BEV_storage[hour]
        deviation_from_mean_BEV = balance - average_12h_balance_before_BEV_storage        

        max_charge_rate = BEV_plugged_in_profile[hour%24] * electric_car_max_charge_rate
                    
        EV_smart_charge = 0.0
        EV_smart_discharge = 0.0
        
        if (smart_charging_enabled) {
            if (balance>=0.0) {
                if (deviation_from_mean_BEV>=0.0) {
                    EV_smart_charge = (electric_car_battery_capacity-BEV_Store_SOC)*deviation_from_mean_BEV/(electric_car_battery_capacity*0.5)         // limited by availability forecast
                    if (EV_smart_charge>max_charge_rate) EV_smart_charge = max_charge_rate                                                              // limited by max charge rate
                    if (EV_smart_charge>(electric_car_battery_capacity-BEV_Store_SOC)) EV_smart_charge = electric_car_battery_capacity-BEV_Store_SOC    // limited to max available SOC
                    if (EV_smart_charge>balance) EV_smart_charge = balance                                                                              // limited to available balance
                }
            } else {
                if (deviation_from_mean_BEV<0.0) {
                    EV_smart_discharge = BEV_Store_SOC*-deviation_from_mean_BEV/(electric_car_battery_capacity*0.5)
                    if (EV_smart_discharge>EV_dumb_charge) EV_smart_discharge = EV_dumb_charge
                    if (EV_smart_discharge>-balance) EV_smart_discharge = -balance
                    if (EV_smart_discharge>BEV_Store_SOC) EV_smart_discharge = BEV_Store_SOC
                }
            }
        }
        
        //EV_smart_charge = 0.0
        //EV_smart_discharge = 0.0
        
        EV_charge = EV_smart_charge
        if (EV_charge<EV_dumb_charge) EV_charge = EV_dumb_charge
        EV_discharge += EV_smart_discharge

        if ((BEV_Store_SOC+EV_charge)>electric_car_battery_capacity) EV_charge = electric_car_battery_capacity - BEV_Store_SOC
        
        data.EV_charge.push([time,EV_charge])
        data.EV_smart_discharge.push([time,EV_smart_discharge])
        
        BEV_Store_SOC += EV_charge - EV_discharge

        s4_BEV_Store_SOC.push(BEV_Store_SOC)
        data.BEV_Store_SOC.push([time,BEV_Store_SOC])
                
        electricity_for_transport = elec_trains_demand + EV_charge
        
        total_EV_charge += EV_charge
        
        data.EL_transport.push([time,electricity_for_transport])
        
        balance_before_elec_store = data.s1_total_variable_supply[hour][1] - data.s1_traditional_elec_demand[hour][1] - s3_spacewater_elec_demand[hour] - s1_industrial_elec_demand[hour] - electricity_for_transport
        s4_balance_before_elec_store.push(balance_before_elec_store)
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
        
        var balance = s4_balance_before_elec_store[hour]
        
        elec_store_charge = 0
        elec_store_discharge = 0
        
        // ---------------------------------------------------------------------------
        // 12 h average store implementation
        // ---------------------------------------------------------------------------
        // +- 12 h average of balance
        var sum = 0; var n = 0;
        for (var i=-12; i<12; i++) {
            var index = hour + i
            if (index>=hours) index-=hours
            if (index<0) index += hours
            sum += s4_balance_before_elec_store[index]
            n++;
        }
        average_12h_balance_before_elec_storage = sum / n;
        deviation_from_mean_elec = balance - average_12h_balance_before_elec_storage
        
        if (electricity_storage_enabled) {
            if (balance>=0.0) {
                if (deviation_from_mean_elec>=0.0) {
                    // charge
                    elec_store_charge = (elec_store_storage_cap-elecstore_SOC)*deviation_from_mean_elec/(elec_store_storage_cap*0.5)
                    if (elec_store_charge>(elec_store_storage_cap - elecstore_SOC)) elec_store_charge = elec_store_storage_cap - elecstore_SOC   // Limit to available SOC
                    if (elec_store_charge>elec_store_charge_cap) elec_store_charge = elec_store_charge_cap                                       // Limit to charge capacity
                    if (elec_store_charge>balance) elec_store_charge = balance
                    balance -= elec_store_charge
                    elecstore_SOC += elec_store_charge
                }
            } else {
                if (deviation_from_mean_elec<0.0) {
                    // discharge
                    elec_store_discharge = elecstore_SOC*-deviation_from_mean_elec/(elec_store_storage_cap*0.5)
                    if (elec_store_discharge>elecstore_SOC) elec_store_discharge = elecstore_SOC                      // Limit to elecstore SOC
                    if (elec_store_discharge>elec_store_charge_cap) elec_store_discharge = elec_store_charge_cap      // Limit to discharge capacity
                    if (elec_store_discharge>-balance) elec_store_discharge = -balance
                    balance += elec_store_discharge
                    elecstore_SOC -= elec_store_discharge
                }
            }
        }
        if (elecstore_SOC<0) elecstore_SOC = 0                                                              // limits here can loose energy in the calc
        if (elecstore_SOC>elec_store_storage_cap) elecstore_SOC = elec_store_storage_cap                    // limits here can loose energy in the calc
        // ----------------------------------------------------------------------------
          
        s5_elecstore_SOC.push(elecstore_SOC)
        data.elecstore_SOC.push([time,elecstore_SOC])        
        data.elec_store_charge.push([time,elec_store_charge])
        data.elec_store_discharge.push([time,elec_store_discharge])
        
        if (balance>=0.0) {
            total_initial_elec_balance_positive += balance
            initial_elec_balance_positive++
        }
                
        // ----------------------------------------------------------------------------
        // Hydrogen
        // ----------------------------------------------------------------------------
        // 1. Electrolysis input
        electricity_for_electrolysis = 0
        if (balance>=0.0) {
            electricity_for_electrolysis = balance
            // Limit by hydrogen electrolysis capacity
            if (electricity_for_electrolysis>electrolysis_cap) electricity_for_electrolysis = electrolysis_cap
            // Limit by hydrogen store capacity
            if (electricity_for_electrolysis>((hydrogen_storage_cap-hydrogen_SOC)/electrolysis_eff)) electricity_for_electrolysis = (hydrogen_storage_cap-hydrogen_SOC)/electrolysis_eff
        }
        
        hydrogen_from_electrolysis = electricity_for_electrolysis * electrolysis_eff
        total_electrolysis_losses += electricity_for_electrolysis - hydrogen_from_electrolysis
        data.electricity_for_electrolysis.push([time,electricity_for_electrolysis])
        hydrogen_SOC += hydrogen_from_electrolysis
        
        // 2. Hydrogen vehicle demand
        hydrogen_for_hydrogen_vehicles = daily_transport_H2_demand / 24.0
        if (hydrogen_for_hydrogen_vehicles>hydrogen_SOC) {
            unmet_hydrogen_demand += hydrogen_for_hydrogen_vehicles - hydrogen_SOC
            hydrogen_for_hydrogen_vehicles = hydrogen_SOC
        }
        hydrogen_SOC -= hydrogen_for_hydrogen_vehicles
        total_hydrogen_for_hydrogen_vehicles += hydrogen_for_hydrogen_vehicles
        
        // 3. Hydrogen to synthetic liquid fuels
        // runs at biomass feedstock rate, limited by hydrogen availability
        // MFIX: POTENTIAL HERE FOR UNMET SYNTH FUEL DEMAND NO STORE
        hourly_biomass_for_biofuel = daily_biomass_for_biofuel/24.0
        hydrogen_to_synth_fuel = (hourly_biomass_for_biofuel/FT_process_biomass_req)*FT_process_hydrogen_req
        if (hydrogen_to_synth_fuel>hydrogen_SOC) {
            unmet_hydrogen_demand += hydrogen_to_synth_fuel - hydrogen_SOC
            hydrogen_to_synth_fuel = hydrogen_SOC
        } 
        hydrogen_SOC -= hydrogen_to_synth_fuel
        
        // 4. Hydrogen to methanation
        // limited to available hydrogen and methanation capacity
        hydrogen_to_methanation = methane_from_biogas/methanation_raw_biogas_to_H2_ratio // max limit on hydrogen to methanation is biogas supply level
        available_hydrogen = hydrogen_SOC-(hydrogen_storage_cap*minimum_hydrogen_store_level)
        if (hydrogen_to_methanation>available_hydrogen) hydrogen_to_methanation = available_hydrogen
        if (hydrogen_to_methanation>methanation_capacity) hydrogen_to_methanation = methanation_capacity
        if (hydrogen_to_methanation<0.0) hydrogen_to_methanation = 0.0
        hydrogen_SOC -= hydrogen_to_methanation
                       
        s5_hydrogen_SOC.push(hydrogen_SOC)
        data.hydrogen_SOC.push([time,hydrogen_SOC])
        
        if ((hydrogen_SOC/hydrogen_storage_cap)<0.01) hydrogen_store_empty_count ++
        if ((hydrogen_SOC/hydrogen_storage_cap)>0.99) hydrogen_store_full_count ++
        
        // subtract electrolysis from electricity balance
        balance -= electricity_for_electrolysis
        
        // ----------------------------------------------------------------------------
        // Dispatchable (backup power via CCGT gas turbines)
        // ---------------------------------------------------------------------------- 
        electricity_from_dispatchable = 0       
        if (balance<0.0) electricity_from_dispatchable = -balance
        // Limit by methane availability
        if (electricity_from_dispatchable>(methane_SOC*dispatchable_gen_eff)) electricity_from_dispatchable = methane_SOC*dispatchable_gen_eff
        // Limit by CCGT capacity
        if (electricity_from_dispatchable>dispatch_gen_cap) electricity_from_dispatchable = dispatch_gen_cap
        // Totals, losses and max capacity utilisation
        total_CCGT_losses += ((1.0/dispatchable_gen_eff)-1.0) * electricity_from_dispatchable
        total_electricity_from_dispatchable += electricity_from_dispatchable
        if (electricity_from_dispatchable>max_dispatchable_capacity) max_dispatchable_capacity = electricity_from_dispatchable
        data.electricity_from_dispatchable.push([time,electricity_from_dispatchable])
        
        // Final electricity balance
        balance += electricity_from_dispatchable
        s5_final_balance.push(balance)

        export_elec = 0.0
        unmet_elec = 0.0
        if (balance>=0.0) {
            export_elec = balance
            total_final_elec_balance_positive += export_elec
            final_elec_balance_positive++
        } else {
            unmet_elec = -balance
            total_final_elec_balance_negative += unmet_elec
            final_elec_balance_negative++
        }
        data.export_elec.push([time,export_elec])
        data.unmet_elec.push([time,unmet_elec])
                
        // ----------------------------------------------------------------------------
        // Methane
        // ----------------------------------------------------------------------------
        methane_from_hydrogen = hydrogen_to_methanation * methanation_efficiency
        total_sabatier_losses += hydrogen_to_methanation - methane_from_hydrogen
        total_anaerobic_digestion_losses += hourly_biomass_for_biogas - methane_from_biogas
        
        // methane_from_biogas: calculated at start
        total_methane_made += methane_from_hydrogen + methane_from_biogas
        methane_to_dispatchable = electricity_from_dispatchable / dispatchable_gen_eff

        // s1_methane_for_industry: calculated in stage 1
        // s1_methane_for_industryCHP
        methane_for_industryCHP = 0 // MFIX: add this in!!
        methane_balance = methane_from_hydrogen + methane_from_biogas
        methane_balance -= methane_to_dispatchable
        methane_balance -= s3_methane_for_spacewaterheat[hour]
        methane_balance -= s1_methane_for_industry[hour]
        methane_balance -= methane_for_industryCHP
        
        s5_methane_SOC.push(methane_SOC)
        data.methane_SOC.push([time,methane_SOC])
        if ((methane_SOC/methane_store_capacity)<0.01) methane_store_empty_count ++
        if ((methane_SOC/methane_store_capacity)>0.99) methane_store_full_count ++
        
        methane_SOC += methane_balance
        if (methane_SOC>methane_store_capacity) {
            methane_store_vented += methane_SOC - methane_store_capacity
            methane_SOC = methane_store_capacity
        }
        
        // ------------------------------------------------------------------------------------
        // Synth fuel
        synth_fuel_produced = hydrogen_to_synth_fuel / FT_process_hydrogen_req
        total_synth_fuel_produced += synth_fuel_produced
        total_synth_fuel_biomass_used += hourly_biomass_for_biofuel
        
        total_FT_losses += (hydrogen_to_synth_fuel + hourly_biomass_for_biofuel) - synth_fuel_produced
        
        synth_fuel_demand = (daily_transport_liquid_demand + daily_industrial_biofuel) / 24.0
        total_synth_fuel_demand += synth_fuel_demand
        
        // ------------------------------------------------------------------------------------
        // Biomass  
        biomass_used = 0
        biomass_used += methane_from_biogas / anaerobic_digestion_efficiency 
        biomass_used += s1_biomass_for_industry[hour]
        biomass_used += hourly_biomass_for_biofuel
        biomass_used += s3_biomass_for_spacewaterheat[hour] 
        
        total_biomass_used += biomass_used
        
    }
    loading_prc(80,"model stage 5");

    // -------------------------------------------------------------------------------
        
    total_unmet_demand = total_final_elec_balance_negative
    
    total_supply += total_ambient_heat_supply
    total_supply += total_solarthermal
    total_supply += total_geothermal_heat
    total_supply += total_biomass_used
    
    total_demand = 0
    total_demand += total_traditional_elec 
    total_demand += total_space_heat_demand
    total_demand += total_industrial_elec_demand
    total_demand += total_industrial_methane_demand
    total_demand += total_industrial_biomass_demand
    
    total_demand += total_EV_charge
    total_demand += total_elec_trains_demand
    total_demand += total_hydrogen_for_hydrogen_vehicles
    total_demand += transport_CH4_demand*10000.0
    total_demand += total_synth_fuel_demand
    
    // -------------------------------------------------------------------------------------------------
    final_store_balance = 0
    
    heatstore_additions =  heatstore_SOC - heatstore_SOC_start
    console.log("heatstore_additions: "+heatstore_additions)
    final_store_balance += heatstore_additions

    BEV_store_additions =  BEV_Store_SOC - BEV_Store_SOC_start
    console.log("BEV_store_additions: "+BEV_store_additions)
    final_store_balance += BEV_store_additions

    elecstore_additions =  elecstore_SOC - heatstore_SOC_start
    console.log("elecstore_additions: "+elecstore_additions)
    final_store_balance += elecstore_additions
        
    hydrogen_store_additions = hydrogen_SOC - hydrogen_SOC_start
    console.log("hydrogen_store_additions: "+hydrogen_store_additions)
    final_store_balance += hydrogen_store_additions
    
    methane_store_additions = methane_SOC - methane_SOC_start
    console.log("methane_store_additions: "+methane_store_additions)
    final_store_balance += methane_store_additions

    console.log("final_store_balance: "+final_store_balance)
    
    console.log("total_heat_spill: "+total_heat_spill);
    
    synth_fuel_balance = total_synth_fuel_produced - total_synth_fuel_demand
    console.log("synth_fuel_balance: "+synth_fuel_balance)
        
    synth_fuel_excess = 0
    synth_fuel_unmet = 0
    if (synth_fuel_balance>0) {
       synth_fuel_excess = synth_fuel_balance;
    } else {
       synth_fuel_unmet = -1*synth_fuel_balance;  
    }
    total_unmet_demand += synth_fuel_unmet
    
    total_spill = methane_store_vented + total_heat_spill + synth_fuel_excess
    
    // -------------------------------------------------------------------------------------------------
    total_exess = total_final_elec_balance_positive + final_store_balance; //total_supply - total_demand
    total_losses = total_grid_losses + total_electrolysis_losses + total_CCGT_losses + total_anaerobic_digestion_losses + total_sabatier_losses + total_FT_losses + total_spill
    total_losses += total_biomass_for_spacewaterheat_loss
    total_losses += total_methane_for_spacewaterheat_loss
    
    unaccounted_balance = total_supply + total_unmet_demand - total_demand - total_losses - total_exess
    console.log("unaccounted_balance: "+unaccounted_balance.toFixed(6))
    // -------------------------------------------------------------------------------------------------
    
    primary_energy_factor = total_supply / total_demand
    
    // -------------------------------------------------------------------------------
    
    total_initial_elec_balance_positive = total_initial_elec_balance_positive / 10000.0
    total_final_elec_balance_negative = total_final_elec_balance_negative / 10000.0
    total_final_elec_balance_positive = total_final_elec_balance_positive / 10000.0
    total_unmet_heat_demand = (total_unmet_heat_demand/ 10000.0).toFixed(3);
    total_synth_fuel_produced = total_synth_fuel_produced / 10000.0
    total_synth_fuel_biomass_used = total_synth_fuel_biomass_used / 10000.0
    total_methane_made = total_methane_made / 10000.0
    total_electricity_from_dispatchable /= 10000.0
    total_biomass_used /= 10000.0
    
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
    var error = 0
    for (var hour = 0; hour < hours; hour++) {
        
        //var test = testlines[hour].split(",");
        //var heatstore_SOC = parseFloat(test[1]);
        //var BEV_Store_SOC = parseFloat(test[2]);
        //var hydrogen_SOC = parseFloat(test[4]);
        //var methane_SOC = parseFloat(test[5]);
        //var final_balance = parseFloat(test[6]);
        
        //error = Math.abs(final_balance-s5_final_balance[hour])
        
        //if (error>1) {
            //out += (hour+2)+"\t"+final_balance.toFixed(1)+"\t"+s5_final_balance[hour].toFixed(1)+"\t"+error+"\n";
        //}
        
        supply = data.s1_total_variable_supply[hour][1]
        demand = data.s1_traditional_elec_demand[hour][1] + data.spacewater_elec[hour][1] + data.industry_elec[hour][1] + data.EL_transport[hour][1] + data.electricity_for_electrolysis[hour][1] + data.elec_store_charge[hour][1]
        balance = (supply + data.unmet_elec[hour][1] + data.electricity_from_dispatchable[hour][1] + data.elec_store_discharge[hour][1]) - demand-data.export_elec[hour][1]
        error += Math.abs(balance)
    } 
    
    console.log("balance error: "+error.toFixed(12));
    
        
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
        } else if(type=="%") {
            scale = 100.0
            units = "%"
            dp = 0
        } 
        
        $(this).html("<span>"+(1*window[key]*scale).toFixed(dp)+"</span><span style='font-size:90%'>"+units+"</span>");
    });

    // Energy stacks visualisation definition
    var scl = 1.0/10000.0;
    var units = "TWh/yr";
    var stacks = [
      {"name":"Supply","height":(total_supply+total_unmet_demand)*scl,"saving":0,
        "stack":[
          {"kwhd":total_supply*scl,"name":"Supply","color":1},
          {"kwhd":total_unmet_demand*scl,"name":"Unmet","color":3}
        ]
      },
      {"name":"Supply","height":(total_supply+total_unmet_demand)*scl,"saving":0,
        "stack":[
          {"kwhd":total_offshore_wind_supply*scl,"name":"Offshore Wind","color":1},
          {"kwhd":total_onshore_wind_supply*scl,"name":"Onshore Wind","color":1},
          {"kwhd":total_solar_supply*scl,"name":"Solar PV","color":1},
          {"kwhd":total_solarthermal*scl,"name":"Solar Thermal","color":1},
          {"kwhd":total_wave_supply*scl,"name":"Wave","color":1},
          {"kwhd":total_tidal_supply*scl,"name":"Tidal","color":1},
          {"kwhd":total_hydro_supply*scl,"name":"Hydro","color":1},
          {"kwhd":total_geothermal_elec*scl,"name":"Geo Thermal Elec","color":1},
          {"kwhd":total_geothermal_heat*scl,"name":"Geo Thermal Heat","color":1},
          {"kwhd":total_nuclear_supply*scl,"name":"Nuclear","color":1},
          {"kwhd":total_biomass_used,"name":"Biomass","color":1},
          {"kwhd":total_ambient_heat_supply*scl,"name":"Ambient","color":1},
          {"kwhd":total_unmet_demand*scl,"name":"Unmet","color":3}
        ]
      },
      
      {"name":"Demand","height":(total_demand+total_losses+total_exess)*scl,"saving":0,
        "stack":[
          {"kwhd":total_demand*scl,"name":"Demand","color":0},
          {"kwhd":total_losses*scl,"name":"Losses","color":2},
          {"kwhd":total_exess*scl,"name":"Exess","color":3}
        ]
      },

      {"name":"Demand","height":(total_demand+total_losses)*scl,"saving":0,
        "stack":[
          {"kwhd":total_traditional_elec*scl,"name":"Trad Elec","color":0},
          {"kwhd":total_space_heat_demand*scl,"name":"Space & Water","color":0},
          {"kwhd":(total_EV_charge+total_elec_trains_demand)*scl,"name":"Electric Transport","color":0},
          {"kwhd":total_hydrogen_for_hydrogen_vehicles*scl,"name":"Hydrogen Transport","color":0},
          {"kwhd":transport_CH4_demand,"name":"Methane Transport","color":0},
          {"kwhd":transport_biofuels_demand,"name":"Biofuel Transport","color":0},
          {"kwhd":transport_kerosene_demand,"name":"Aviation","color":0},
          // Industry
          {"kwhd":total_industrial_elec_demand*scl,"name":"Industry Electric","color":0},
          {"kwhd":total_industrial_methane_demand*scl,"name":"Industry Methane","color":0},
          {"kwhd":total_industrial_biomass_demand*scl,"name":"Industry Biomas","color":0},
          {"kwhd":industrial_biofuel,"name":"Industry Biofuel","color":0},/*
          {"kwhd":total_industry_solid/3650,"name":"Industry Biomass","color":0},
          // Backup, liquid and gas processes*/
          {"kwhd":total_grid_losses*scl,"name":"Grid losses","color":2},
          {"kwhd":total_electrolysis_losses*scl,"name":"H2 losses","color":2},
          {"kwhd":total_CCGT_losses*scl,"name":"CCGT losses","color":2},
          {"kwhd":total_FT_losses*scl,"name":"FT losses","color":2},
          {"kwhd":total_sabatier_losses*scl,"name":"Sabatier losses","color":2},
          {"kwhd":total_anaerobic_digestion_losses*scl,"name":"AD losses","color":2},
          {"kwhd":(total_biomass_for_spacewaterheat_loss+total_methane_for_spacewaterheat_loss)*scl,"name":"Boiler loss","color":2},
          {"kwhd":total_spill*scl,"name":"Total spill","color":2},

          /*
          {"kwhd":total_direct_gas_losses/3650,"name":"Direct gas loss","color":2},
          {"kwhd":total_direct_liquid_losses/3650,"name":"Direct liquid loss","color":2},

          {"kwhd":total_liion_losses/3650,"name":"Liion losses","color":2},
          {"kwhd":total_losses*scl,"name":"Losses","color":2},*/
          {"kwhd":total_exess*scl,"name":"Exess","color":3}
        ]
      }
    ];
    draw_stacks(stacks,"stacks",1000,600,units)   
}
// ---------------------------------------------------------------------------    
	
function fullzcb2_view(start,end,interval)
{
    var dataout = data_view(start,end,interval);
    if (view_mode=="")
    {
        $.plot("#placeholder", [

            // {label: "Heatstore", data:dataout.heatstore, color:"#cc3311"},

            {stack:true, label: "Traditional", data:dataout.s1_traditional_elec_demand, color:"#0044aa"},
            {stack:true, label: "Industry & Cooking", data:dataout.industry_elec, color:"#1960d5"},
            {stack:true, label: "Electric Heat", data:dataout.spacewater_elec, color:"#cc6622"},
            {stack:true, label: "Electric Transport", data:dataout.EL_transport, color:"#aac15b"},
            {stack:true, label: "Elec Store Charge", data:dataout.elec_store_charge, color:"#006a80"},
            {stack:true, label: "Electrolysis", data:dataout.electricity_for_electrolysis, color:"#00aacc"},
            {stack:true, label: "Exess", data:dataout.export_elec, color:"#33ccff", lines: {lineWidth:0, fill: 0.4 }},            
            {stack:false, label: "Supply", data:dataout.s1_total_variable_supply, color:"#000000", lines: {lineWidth:0.2, fill: false }}

            ], {
                canvas: true,
                series: {lines: {lineWidth:0, fill: 1.0 } },
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
    }
    if (view_mode=="stores")
    {
        $.plot("#placeholder", [
                {stack:true, label: "Battery Store", data:dataout.elecstore_SOC, yaxis:3, color:"#1960d5", lines: {lineWidth:0, fill: 0.8 }},
                {stack:true, label: "Heat Store", data:dataout.heatstore_SOC, yaxis:3, color:"#cc3311", lines: {lineWidth:0, fill: 0.8 }},
                {stack:true, label: "BEV Store", data:dataout.BEV_Store_SOC, yaxis:3, color:"#aac15b", lines: {lineWidth:0, fill: 0.8 }},
                {stack:true, label: "Hydrogen Store", data:dataout.hydrogen_SOC, yaxis:3, color:"#97b5e7", lines: {lineWidth:0, fill: 0.8 }},
                {stack:true, label: "Methane Store", data:dataout.methane_SOC, yaxis:3, color:"#ccaa00", lines: {lineWidth:0, fill: 0.8 }}
            ], {
                xaxis:{mode:"time", min:start, max:end, minTickSize: [1, "hour"]},
                yaxes: [{},{min: 0},{}],
                grid: {hoverable: true, clickable: true},
                selection: { mode: "x" },
                legend: {position: "nw"}
            }
        );
    }
    if (view_mode=="backup")
    {
        $.plot("#placeholder", [
                {stack:true, label: "CCGT output", data:dataout.electricity_from_dispatchable, yaxis:1, color:"#ccaa00", lines: {lineWidth:0, fill: 1.0 }},
                {stack:true, label: "Elec Store discharge", data:dataout.elec_store_discharge, yaxis:1, color:"#1960d5", lines: {lineWidth:0, fill: 1.0 }},
                {stack:true, label: "EV Smart discharge", data:dataout.EV_smart_discharge, yaxis:1, color:"#aac15b", lines: {lineWidth:0, fill: 1.0 }},
                {stack:false, label: "Heat Store", data:dataout.heatstore_SOC, yaxis:2, color:"#cc3311", lines: {lineWidth:1, fill: false }},
                {stack:false, label: "Battery Store", data:dataout.elecstore_SOC, yaxis:2, color:"#1960d5", lines: {lineWidth:1, fill: false }},
                {stack:false, label: "BEV Store", data:dataout.BEV_Store_SOC, yaxis:2, color:"#aac15b", lines: {lineWidth:1, fill: false }},       
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
