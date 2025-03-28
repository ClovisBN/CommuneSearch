require "net/http"
require "uri"
require "json"

class AutocompleteController < ApplicationController
  def communes
    query = params[:q]
    uri = URI("https://api-adresse.data.gouv.fr/search")
    uri.query = URI.encode_www_form(q: query, type: "municipality", limit: 10)

    begin
      res = Net::HTTP.get_response(uri)

      if res.is_a?(Net::HTTPSuccess)
        data = JSON.parse(res.body)
        results = data["features"].map do |feature|
          {
            nom: feature["properties"]["city"],
            code: feature["properties"]["citycode"]
          }
        end.uniq { |c| c[:code] }
        render json: results
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
