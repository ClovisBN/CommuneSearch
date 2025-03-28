require "net/http"
require "uri"
require "json"

class AutocompleteController < ApplicationController
  def communes
    query = params[:q]
    uri = URI("https://geo.api.gouv.fr/communes")
    uri.query = URI.encode_www_form(nom: query, fields: "nom,code,population", boost: "population", limit: 50)

    begin
      res = Net::HTTP.get_response(uri)

      if res.is_a?(Net::HTTPSuccess)
        data = JSON.parse(res.body)

        results = data.map do |commune|
          {
            nom: commune["nom"],
            code: commune["code"],
            population: commune["population"] || 0
          }
        end

        sorted = results.sort_by { |c| -c[:population] }.first(10)

        render json: sorted
      else
        render json: { error: "Erreur lors de la récupération des données depuis l'API externe" }, status: :bad_gateway
      end
    rescue JSON::ParserError => e
      logger.error "Erreur de parsing JSON: #{e.message}"
      render json: { error: "Erreur lors du traitement des données reçues" }, status: :internal_server_error
    rescue StandardError => e
      logger.error "Erreur dans AutocompleteController#communes: #{e.message}"
      render json: { error: "Erreur interne du serveur" }, status: :internal_server_error
    end
  end
end
