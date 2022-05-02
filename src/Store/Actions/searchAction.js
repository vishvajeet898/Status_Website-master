import axios from 'axios';

export const searchFlight = (carrier, flight) => {
    return (dispatch) => {

        //get date
        const today = new Date();
        const todayFormatted = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
        const appId = 'acd737ee';
        const appKey = '9fe90940ef77674c913377d07c629d73' ;

      //  let url = `/flex/flightstatus/rest/v2/json/flight/status/${carrier}/${flight}/arr/${todayFormatted}?appId=${appId}&appKey=${appKey}&utc=false`
        let url1 = `http://localhost:8080/status?flightName=${carrier+flight}&date=${todayFormatted}`

        
        return axios.get(url1).then(response => {

            //dictionary for flightStatus code
            let flightStatus = {
                'A': 'Active',
                'D': 'Diverted',
                'DN': 'Data source needed',
                'L': 'Landed',
                'NO': 'Not Operational',
                'R': 'Redirected',
                'S': 'Scheduled',
                'U': 'Unknown'
            };

            let imptData = {};

            let departureDate;
            let departureTime;
            let arrivalDate;
            let arrivalTime;
            let flightNumber = carrier + flight;
   
            let specificData = response.data.flightStatuses[0];

            //formatting date result
            if (specificData.departureDate.dateLocal) {
                let splitDepTime = specificData.departureDate.dateLocal.split('T');
                [departureDate, departureTime] = splitDepTime;
            }

            if (specificData.arrivalDate.dateLocal) {
                let splitArrTime = specificData.arrivalDate.dateLocal.split('T');
                [arrivalDate, arrivalTime] = splitArrTime;
            }

            const flightLength = specificData.flightDurations.scheduledBlockMinutes;
            const flightDuration = `${Math.floor(flightLength/60)} Hours ${flightLength%60} Mins`;

            //packing selected data into an object
            imptData = {
                flightNumber: flightNumber,
                from: specificData.departureAirportFsCode,
                to: specificData.arrivalAirportFsCode,
                flightDuration: flightDuration,
                departureDate: departureDate,
                departureTime: departureTime,
                status: flightStatus[specificData.status],
                arrivalDate: arrivalDate,
                arrivalTime: arrivalTime,
                delay: specificData.delays.arrivalGateDelayMinutes,
                departureTerminal: specificData.airportResources.departureTerminal,
                arrivalTerminal: specificData.airportResources.arrivalTerminal,
                gate: specificData.airportResources.arrivalGate,
                baggage: specificData.airportResources.baggage
            }
            dispatch({type: 'SEARCH_SUCCESS', data: imptData})
        }).catch(err => dispatch({type: 'SEARCH_ERROR'}))
    }
}