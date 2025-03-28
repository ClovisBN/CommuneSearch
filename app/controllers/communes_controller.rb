require "net/http"
require "uri"
require "json"

class CommunesController < ApplicationController
  def show
    insee_code = params[:insee_code]
    uri = URI("https://geo.api.gouv.fr/communes/#{insee_code}")
    uri.query = URI.encode_www_form(fields: "nom,code,codeDepartement,codeRegion,region,departement,population,surface,centre")

    response = Net::HTTP.get(uri)
    @commune = JSON.parse(response)

    if @commune["nom"].nil?
      redirect_to root_path, alert: "Commune introuvable."
    end
  end
end
