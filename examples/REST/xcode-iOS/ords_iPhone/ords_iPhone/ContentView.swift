//
//  FetchView.swift
//
//  Created by Roberto Breve  on 4.10.2019.
//  Copyright © 2019 Roberto Breve . All rights reserved.
//
import Foundation
import SwiftUI
import Combine

struct Response: Codable {
    var items: [items]
}

struct items: Codable {
    var id: Int
    var name: String
    var phone: String
    var address: String
    var city: String
    var state: String
    var zip: String
}

struct ContentView: View {
  
    @State var results = [items]()
   
    var body: some View {
        NavigationView {
            List(results.sorted { $1.id > $0.id}, id: \.id) { items in
                empSelect(items: items)
                }
                .onAppear(perform: loadData)
                .navigationBarTitle(Text("ORDS on iOS"))
            }
        
        }
        
        func loadData() {

            guard let url = URL(string: "https://REST_URL/") else {
                print("Invalid URL")
                return
            }
            
            let request = URLRequest(url: url)
            
            URLSession.shared.dataTask(with: request) { data, response, error in
                if let data = data {
                                        
                    if let decodedResponse = try? JSONDecoder().decode(Response.self, from: data) {
                        // we have good data – go back to the main thread
                        DispatchQueue.main.async {
                            print(decodedResponse)
                            // update our UI
                            self.results = decodedResponse.items
                        }

                        // everything is good, so we can exit
                        return
                    }
                }

                // if we're still here it means there was a problem
                print("Fetch failed: \(error?.localizedDescription ?? "Unknown error")")
            }.resume()
            
            
        }
        
    }

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

struct empSelect: View {
    let items: items
    var body: some View {
        NavigationLink(destination: EmpDetail(name: items.name,
                                               phone: items.phone,
                                               address: items.address,
                                               city: items.city,
                                               state: items.state,
                                               zip: items.zip)) {
            Text(String(items.id))
                .foregroundColor(Color.black)
                .padding(.all, 8.0)
                .frame(width: 35.0)
                .overlay(RoundedRectangle(cornerRadius: 20)
                            .stroke(Color.black, lineWidth: 3)
                )
            VStack (alignment: .leading) {
                Text(items.name)
                Text(items.phone)
                    .font(.system(size: 11))
                    .foregroundColor(Color.gray)
            }
        }
    }
}
