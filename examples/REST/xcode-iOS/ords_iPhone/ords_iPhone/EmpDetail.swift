//
//  empDetail.swift
//  ords_iPhone
//
//  Created by Brian Spendolini on 3/5/21.
//

import SwiftUI
import MapKit
import CoreLocation

struct EmpDetail: View {
    
func getLocation(from address: String, completion: @escaping (_ location: CLLocationCoordinate2D?)-> Void) {
    let geocoder = CLGeocoder()
    geocoder.geocodeAddressString(address) { (placemarks, error) in
        guard let placemarks = placemarks,
        let location = placemarks.first?.location?.coordinate else {
            completion(nil)
            return
        }
        
        completion(location)
    }
}
    

    
    @State var location: CLLocationCoordinate2D?
    @State var region = MKCoordinateRegion(center:  CLLocationCoordinate2D(latitude: 30.16622932512246, longitude: -97.73921163282644), span: MKCoordinateSpan(latitudeDelta: 0.5, longitudeDelta: 0.5))
    
    var name: String
    var phone: String
    var address: String
    var city: String
    var state: String
    var zip: String
    
    var body: some View {
        VStack(alignment: .leading) {

                Text(name)
                    .font(.title)

                Text(phone)
                    .font(.subheadline)
                Divider()

                Text(address)
                    .font(.headline)
                    .lineLimit(50)
                Text(city)
                    .font(.headline)
                    .lineLimit(50)
                Text(state)
                    .font(.headline)
                    .lineLimit(50)
                Text(zip)
                    .font(.headline)
                    .lineLimit(50)
            Divider()
            Map(coordinateRegion: $region)
            }.padding().navigationBarTitle(Text(name), displayMode: .inline)
        .onAppear {
            self.getLocation(from: address + " " +
                                   city + " " +
                                   state + " " +
                                   zip) { coordinates in
                print(address + " " +
                        city + " " +
                        state + " " +
                        zip)
                print(coordinates) // Print here
                self.location = coordinates // Assign to a local variable for further processing
            }
    }
    }

struct EmpDetail_Previews: PreviewProvider {
    static var previews: some View {
        EmpDetail(name: "name", phone: "phone", address: "address", city: "city", state: "state", zip: "zip")
    }
}

}
